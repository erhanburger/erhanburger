"""Build the Half Pounder asset with NumPy and Pillow (no remote inputs).

Run from any directory: python scripts/build-half-pounder.py
The existing menu image supplies color and surface detail for the baked textures.
"""

import io
import json
import math
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PHOTO = Image.open(ROOT / "IMG_0352.png").convert("RGB").resize((540, 540), Image.Resampling.LANCZOS)
TAU = 2 * math.pi
RNG = np.random.default_rng(61039)
NOISE_GRID = np.random.default_rng(42).uniform(-1, 1, (32, 32, 32))


class Glb:
    """Pack embedded textures, indexed meshes and named ingredient nodes."""

    def __init__(self):
        self.data = bytearray()
        self.doc = {
            "asset": {"version": "2.0", "generator": "Half Pounder asset builder"},
            "scene": 0, "scenes": [{"nodes": []}],
            "nodes": [], "meshes": [], "materials": [],
            "accessors": [], "bufferViews": [], "buffers": [],
            "images": [], "textures": [], "samplers": [
                {"wrapS": 10497, "wrapT": 33071, "magFilter": 9729, "minFilter": 9987}
            ],
        }

    def add(self, collection, item):
        index = len(self.doc[collection])
        self.doc[collection].append(item)
        return index

    def blob(self, data, target=None):
        self.data.extend(bytes(-len(self.data) % 4))
        view = {"buffer": 0, "byteOffset": len(self.data), "byteLength": len(data)}
        if target is not None:
            view["target"] = target
        self.data.extend(data)
        return self.add("bufferViews", view)

    def texture(self, pixels, quality=None):
        stream = io.BytesIO()
        image = Image.fromarray(np.uint8(np.clip(pixels, 0, 255)))
        if quality:
            image.save(stream, format="JPEG", quality=quality, subsampling=0)
        else:
            image.save(stream, format="PNG", optimize=True)
        view = self.blob(stream.getvalue())
        source = self.add("images", {"bufferView": view, "mimeType": "image/jpeg" if quality else "image/png"})
        return self.add("textures", {"source": source, "sampler": 0})

    def material(self, name, color=None, roughness=.65, texture=None, normal=None, double_sided=False):
        pbr = {"metallicFactor": 0, "roughnessFactor": roughness}
        if color is not None:
            pbr["baseColorFactor"] = to_linear(color).tolist() + [1]
        material = {"name": name, "pbrMetallicRoughness": pbr}
        if texture is not None:
            pbr["baseColorTexture"] = {"index": texture}
        if normal is not None:
            material["normalTexture"] = {"index": normal}
        if double_sided:
            material["doubleSided"] = True
        return self.add("materials", material)

    def ingredient(self, name, height, *primitives):
        mesh = self.add("meshes", {"name": name, "primitives": list(primitives)})
        node = self.add("nodes", {"name": name, "mesh": mesh, "extras": {"stackHeight": height}})
        self.doc["scenes"][0]["nodes"].append(node)

    def primitive(self, material, positions, uvs, indices, colors=None):
        positions = np.asarray(positions, dtype="<f4")
        uvs = np.asarray(uvs, dtype="<f4")
        indices = np.asarray(indices, dtype="<u2")
        faces = indices.reshape(-1, 3)
        points = positions[faces]
        dp1, dp2 = points[:, 1] - points[:, 0], points[:, 2] - points[:, 0]
        normals = np.zeros_like(positions)
        weighted = np.cross(dp1, dp2)
        for slot in faces.T:
            np.add.at(normals, slot, weighted)
        normal_length = np.linalg.norm(normals, axis=1)
        normals[normal_length < 1e-12] = [0, 1, 0]
        normals /= np.linalg.norm(normals, axis=1, keepdims=True)
        pos = self.accessor(positions, "VEC3")
        self.doc["accessors"][pos].update(min=positions.min(axis=0).tolist(), max=positions.max(axis=0).tolist())
        attributes = {"POSITION": pos, "NORMAL": self.accessor(normals, "VEC3")}
        if "normalTexture" in self.doc["materials"][material]:
            attributes["TEXCOORD_0"] = self.accessor(np.round(65535 * uvs).astype("<u2"), "VEC2", normalized=True)
            uv = uvs[faces]
            dt1, dt2 = uv[:, 1] - uv[:, 0], uv[:, 2] - uv[:, 0]
            area = dt1[:, 0] * dt2[:, 1] - dt1[:, 1] * dt2[:, 0]
            tangent = (dp1 * dt2[:, 1:2] - dp2 * dt1[:, 1:2]) / area[:, None]
            bitangent = (dp2 * dt1[:, :1] - dp1 * dt2[:, :1]) / area[:, None]
            along, across = np.zeros_like(positions), np.zeros_like(positions)
            for slot in faces.T:
                np.add.at(along, slot, tangent)
                np.add.at(across, slot, bitangent)
            along -= np.sum(normals * along, axis=-1, keepdims=True) * normals
            empty = np.linalg.norm(along, axis=1) < 1e-8
            along[empty] = np.cross(normals[empty], [0, 0, 1])
            along /= np.linalg.norm(along, axis=1, keepdims=True)
            hand = np.where(np.sum(np.cross(normals, along) * across, axis=1) < 0, -1, 1)
            basis = np.column_stack((along, hand)).astype("<f4")
            attributes["TANGENT"] = self.accessor(basis, "VEC4")
        if colors is not None:
            # Four packed channels preserve vertex stride alignment.
            rgba = np.column_stack((np.round(255 * to_linear(colors)), np.full(len(colors), 255)))
            attributes["COLOR_0"] = self.accessor(rgba.astype("u1"), "VEC4", normalized=True)
        return {"attributes": attributes, "indices": self.accessor(indices, "SCALAR", is_index=True),
                "material": material}

    def accessor(self, array, shape, is_index=False, normalized=False):
        view = self.blob(array.tobytes(), 34963 if is_index else 34962)
        component = {"f": 5126, 1: 5121, 2: 5123}["f" if array.dtype.kind == "f" else array.dtype.itemsize]
        accessor = {"bufferView": view, "componentType": component, "count": len(array), "type": shape}
        if normalized:
            accessor["normalized"] = True
        return self.add("accessors", accessor)

    def save(self, path):
        self.data.extend(bytes(-len(self.data) % 4))
        self.doc["buffers"].append({"byteLength": len(self.data)})
        model = json.dumps(self.doc, separators=(",", ":")).encode()
        model += b" " * (-len(model) % 4)
        with path.open("wb") as file:
            file.write(struct.pack("<4sII", b"glTF", 2, 28 + len(model) + len(self.data)))
            file.write(struct.pack("<I4s", len(model), b"JSON"))
            file.write(model)
            file.write(struct.pack("<I4s", len(self.data), b"BIN\0"))
            file.write(self.data)


def to_linear(rgb):
    srgb = np.clip(np.asarray(rgb) / 255, 0, 1)
    return np.where(srgb < .04045, srgb / 12.92, ((srgb + .055) / 1.055) ** 2.4)


def texture_grid(width, height):
    return np.meshgrid(np.linspace(0, 1, width, endpoint=False), np.linspace(0, 1, height))


def seamless_patch(box, width, height, tiles):
    """Mirror the photo crop with continuous edges, then remove the broad lighting gradient."""
    crop = PHOTO.crop(box).resize((width // (tiles * 2), height // 2), Image.Resampling.BICUBIC)
    pixels = np.asarray(crop, dtype=float)
    pixels = np.concatenate([pixels, pixels[:, ::-1]], axis=1)
    pixels = np.concatenate([pixels, pixels[::-1]], axis=0)
    pixels = np.tile(pixels, (1, tiles, 1))
    pixels = np.asarray(Image.fromarray(np.uint8(pixels)).resize((width, height)), dtype=float)
    blurred = np.asarray(Image.fromarray(np.uint8(pixels)).filter(ImageFilter.GaussianBlur(12)), dtype=float)
    return pixels, pixels - blurred


def normal_map(height, strength, u_step=1, v_step=1):
    dv, du = np.gradient(height)
    vectors = np.stack((-du * strength / u_step, -dv * strength / v_step, np.ones_like(height)), axis=-1)
    return 127.5 + 127.5 * vectors / np.linalg.norm(vectors, axis=-1, keepdims=True)


def periodic_noise(u, v, scale):
    return (np.sin(TAU * (scale * u + 2.7 * v) + np.sin(TAU * (3 * u - 3.8 * v)))
            * np.cos(TAU * (3 * u + 7.2 * v + .3)))


def surface_noise(x, y, z, scale):
    point = np.stack((x, y, z)) * scale + 5.9
    corner = np.floor(point).astype(int)
    frac = point - corner
    frac = frac * frac * (3 - 2 * frac)
    output = np.zeros_like(x)
    for a, b, c in ((a,b,c) for a in (0,1) for b in (0,1) for c in (0,1)):
        weights = np.where(np.array([a,b,c])[:, None, None], frac, 1-frac)
        grid = (corner + np.array([a,b,c])[:, None, None]) % len(NOISE_GRID)
        output += weights.prod(axis=0) * NOISE_GRID[tuple(grid)]
    return output


def bread_textures(crown, profile):
    w, h = 512, 256
    u, v = texture_grid(w, h)
    progress = v * (len(profile) - 1)
    knots = np.arange(len(profile))
    radius, y = (np.interp(progress, knots, points) for points in np.asarray(profile).T)
    x, z = radius * np.cos(u * TAU), radius * np.sin(u * TAU)
    mottle = 17 * surface_noise(x, y, z, 3.6) + 7.8 * surface_noise(x, y, z, 10.2)
    crumbs = surface_noise(x, y, z, 88)
    pore = np.clip(crumbs - .35, 0, 1) * 62
    photo = np.asarray(PHOTO.crop((217, 414, 320, 439)).resize((512, 128)), dtype=float)
    soft = np.asarray(Image.fromarray(np.uint8(photo)).filter(ImageFilter.GaussianBlur(9)), dtype=float)
    # Map the detail over the bun's surface rather than along polar meridians.
    detail = (photo - soft)[((118 * z + 63 * y) % 128).astype(int),
                           ((244 * x - 98 * y) % 512).astype(int)]
    if crown:
        toast = np.clip(y * 4.3, 0, 1)
        crown_tone = 27 * np.clip((y - .26) * 2.6, 0, 1)
        skin = np.array([140, 80, 41]) + toast[..., None] * [55, 49, 28] - crown_tone[..., None]
    else:
        toast = np.clip(y * 8.7, 0, 1)
        skin = np.array([100, 50, 27]) + toast[..., None] * [95, 79, 50]
    crumb_edge = (.165 if crown else .656) + mottle * .00095
    distance = (v - crumb_edge) * (-1 if crown else 1)
    crumb_mix = np.clip(distance * 105 + .5, 0, 1)
    crumb = np.array([221, 178, 117]) + 7 * crumbs[..., None]
    bake = skin * (1 - crumb_mix[..., None]) + crumb * crumb_mix[..., None]
    bake += mottle[..., None] + detail * .43 - pore[..., None] * (.29 + .62 * crumb_mix[..., None])
    u_step = np.maximum(.001, radius * TAU / w)
    v_step = np.maximum(.001, np.hypot(np.gradient(radius, axis=0), np.gradient(y, axis=0)))
    normal = normal_map(detail[:, :, 0] * .000026 - pore * .000054 + crumbs *.0004, 1, u_step, v_step)
    return bake, normal


def beef_textures():
    w, h = 1024, 128
    u, v = texture_grid(w, h)
    first, first_detail = seamless_patch((189, 281, 293, 324), w, h, 4)
    second, second_detail = seamless_patch((191, 348, 290, 381), w, h, 5)
    blend = .5 + .5 * np.sin(TAU * (3 * u + .24 * np.sin(v * 5)))
    photo = first * blend[..., None] + second * (1 - blend[..., None])
    detail = first_detail * blend[..., None] + second_detail * (1 - blend[..., None])
    heat = periodic_noise(u, v, 11)
    # Retain the grill mottling while reducing the photo's highlights.
    bake = .54 * photo + .26 * detail + [34, 20, 14] + heat[..., None] * 7
    ht = detail[:, :, 0] * .023 + .19 * periodic_noise(u, v, 44)
    return bake, normal_map(ht, 1.8)


def grid(nu, nv, sample, reverse=False):
    positions, uvs, indices, colors = [], [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            u, v = i / nu, j / nv
            xyz, rgb = sample(u, v)
            positions.append(xyz)
            uvs.append([u, v])
            if rgb is not None:
                colors.append(rgb)
            if i < nu and j < nv:
                a = j * (nu + 1) + i
                b = a + nu + 1
                indices.extend([a, a + 1, b, b, a + 1, b + 1] if reverse
                               else [a, b, a + 1, b, b + 1, a + 1])
    return positions, uvs, indices, colors


def merge(glb, material, pieces):
    positions, uvs, indices, colors = [], [], [], []
    for points, uv, faces, vertex_color in pieces:
        indices.extend(len(positions) + i for i in faces)
        positions.extend(points)
        uvs.extend(uv)
        colors.extend(vertex_color)
    return glb.primitive(material, positions, uvs, indices, colors or None)


def lathe(profile, deform, shade=None, cols=80, rows=28, offset=(0, 0, 0)):
    """Follow an ingredient cross-section from the bottom face around to the top."""
    interp = np.asarray(profile)

    def sample(u, v):
        t = u * TAU
        idx = v * (len(interp) - 1)
        lo = math.floor(idx)
        r, y = interp[lo] + (idx - lo) * (interp[min(lo + 1, len(interp) - 1)] - interp[lo])
        r, y = deform(t, r, y, v)
        rgb = None if shade is None else shade(t, r, y, v)
        return (offset[0] + r * math.cos(t), offset[1] + y, offset[2] + r * math.sin(t)), rgb

    return grid(cols, rows, sample)


def bread_deform(t, r, y, v):
    wave = .019 * math.cos(3*t+.9) + .011 * math.sin(7*t) + .005 * math.sin(16*t+7*v)
    return r * (1 + wave), y + (min(y, .07) / .07) * r * (.014 * math.sin(3*t) + .005 * math.sin(10*t))


def bread(glb, crown):
    radius, dome = 1.22, .68
    if crown:
        profile = [(0,.008),(.78,.008),(1.04,.01),(1.15,.026),(1.205,.063)]
        profile += [(radius * math.cos(t), .09 + dome * math.sin(t))
                    for t in np.linspace(0, math.pi / 2, 19)]
    else:
        profile = [(0,.005),(.75,.004),(1.04,.017),(1.15,.067),(1.19,.136),(1.19,.215),
                   (1.17,.284),(1.10,.329),(.88,.34),(.48,.337),(0,.337)]
    albedo, bump = bread_textures(crown, profile)
    material = glb.material("Baked sesame crust" if crown else "Toasted heel and cut crumb",
                            roughness=.64 if crown else .74, texture=glb.texture(albedo, 89),
                            normal=glb.texture(bump, 89))
    if not crown:
        glb.ingredient("bun", .344, merge(glb, material, [lathe(profile, bread_deform)]))
        return
    seeds = []
    coords = []
    while len(coords) < 115:
        x, z = RNG.uniform(-1.18, 1.18, 2)
        if x*x + z*z < 1.15**2 and all((x-p)**2 + (z-q)**2 > .062**2 for p, q in coords):
            coords.append((x, z))
    for x, z in coords:
        a = math.atan2(z, x)
        r = math.hypot(x, z)
        y = .09 + dome * math.sqrt(1 - (r / radius)**2)
        r, y = bread_deform(a, r, y, .53 + .28 * y)
        center = np.array([r * math.cos(a), y, r * math.sin(a)])
        normal = np.array([x/radius**2,(y-.09)/dome**2,z/radius**2])
        normal /= np.linalg.norm(normal)
        center += normal * .003
        across = np.cross(normal, (0,0,1))
        across /= np.linalg.norm(across)
        down = np.cross(normal, across)
        spin = RNG.uniform(0, TAU)
        long = math.cos(spin)*across + math.sin(spin)*down
        short = np.cross(normal, long)
        length, width, thick = RNG.uniform([.024,.011,.009],[.043,.018,.015])
        color = RNG.uniform(0, 1) * np.array([35,36,36]) + [205,163,104]

        def seed(u, v):
            theta, latitude = u * TAU, (v - .5) * math.pi
            sh = math.cos(latitude)
            p = (center + length * long * math.cos(theta) * sh
                 + normal * thick * math.sin(latitude)
                 + short * width * math.sin(theta) * sh * (1 + .29 * math.cos(theta)))
            return p, color + 15 * math.sin(latitude)

        seeds.append(grid(8, 5, seed, reverse=True))
    sesame = glb.material("Roasted sesame", roughness=.70)
    glb.ingredient("top", .79, merge(glb, material, [lathe(profile, bread_deform, cols=88, rows=38)]),
                   merge(glb, sesame, seeds))


def beef(glb):
    albedo, bump = beef_textures()
    material = glb.material("Griddled beef", roughness=.72, texture=glb.texture(albedo, 91),
                            normal=glb.texture(bump, 89))
    profile = [(0,.018),(.72,.015),(.97,.017),(1.09,.029),(1.14,.057),(1.16,.091),
               (1.16,.16),(1.13,.218),(1.06,.253),(.91,.266),(.65,.266),(.32,.262),(0,.262)]

    def deform(t, r, y, v):
        coarse = .032 * math.sin(t*5+2.4) + .021 * math.cos(t*9+2*v)
        blister = .020 * math.sin(t*41+8*v) * math.cos(t*13-17*v)
        fine = .011 * math.sin(t*63+32*v+math.sin(t*29)) * math.cos(v*45+t*7)
        vertical = (coarse * .36 + blister * .45 + fine*.39) * math.sin(math.pi * r / 2.28)
        return r * (1 + coarse + blister + fine), y + vertical

    glb.ingredient("beef", .263, merge(glb, material, [lathe(profile, deform, cols=104, rows=38)]))


def cheese(glb):
    material = glb.material("Soft melted cheese", roughness=.45, double_sided=True)
    angle = .24
    c, s = math.cos(angle), math.sin(angle)

    def shape(u, v, underside=False):
        x, z = (u - .5) * 2.19, (v - .5) * 2.19
        # Round the corners and let the unsupported parts droop.
        corner = (abs(x*z) / 1.2) ** 9
        x = x * (1-.058*corner) + .022 * math.sin(z*6)
        z = z * (1-.058*corner) + .018 * math.sin(x*8.8)
        reach = max(0, math.hypot(x,z)-.93)
        droop = reach**1.3 * (.59 + .12 * math.cos(x*7 + z*4))
        y = .063 - droop + .009 * math.sin(8*x + z*3.7)*math.sin(z*4.5)
        rgb = np.array([215,129,42]) + [9*corner, 10*corner, 7*corner]
        rgb = rgb - 13 * reach + 7 * math.cos(x*5+z*7) + 4 * math.sin(z*8.7-x*8.2)
        return (c*x-s*z, y - (.015 if underside else 0), s*x+c*z), rgb

    top = grid(32, 32, shape)
    bottom = grid(32, 32, lambda u,v: shape(u,v,True), reverse=True)
    edges = []
    for edge in (lambda t: (t,0), lambda t: (1,t), lambda t: (1-t,1), lambda t: (0,1)):
        edges.append(grid(32, 1, lambda u,v: shape(*edge(u), v > .5)))
    glb.ingredient("cheese", .054, merge(glb, material, [top, bottom, *edges]))


def lettuce(glb):
    material = glb.material("Ruffled lettuce, veins and blade", roughness=.56, double_sided=True)
    leaves = []
    for i in range(5):
        angle = .24 + TAU * i / 5

        def shape(u, v):
            across = 2*u - 1
            width = .73 * math.sin(math.pi * v**.65)**.54
            taper = v**3 * (.068 * math.sin(u*TAU*8+i) + .035 * math.cos(u*TAU*15+i))
            x = .03 + 1.32*v + taper
            z = across * width * (1.0 + .080 * math.sin(v * 29 + i))
            ruffle = v**1.6 * (.057 * math.sin(u*TAU*4 + 4*v+i) + .029 * math.cos(u*TAU*9 + v*9))
            warp = .027 * math.sin(u*TAU*2 + v*8 + i)
            vein = math.exp(-abs(across)*25) * (1-v*.7)
            branches = (max(0, math.cos(v*43-abs(across)*5+.45*math.sin(v*13)))**18) * (1-abs(across)**2)
            y = .06 + i*.01 + .027*math.sin(4.3*v) + warp + ruffle + .012*vein + .006*branches
            tone = 11*math.sin(v*13 + u*8) + 5*math.cos(v*61 + u*88) + 9*math.cos(u*21+v*30)
            rgb = np.array([112,141,42]) + [66*vein, 39*vein, 57*vein] + [18*branches,11*branches,9*branches]
            rgb = rgb + tone - v * np.array([28,15,17])
            return (x * math.cos(angle)-z*math.sin(angle), y, x*math.sin(angle)+z*math.cos(angle)), rgb

        leaves.append(grid(40, 24, shape))
    glb.ingredient("lettuce", .151, merge(glb, material, leaves))


def vegetables(glb):
    styles = {
        "tomato": (.55, .12, 3, [.58, .18, .35], [183,49,26], [122,28,15], [242,171,77]),
        "cucumber": (.37, .078, 4, [.52, .7, .34, .59], [174,187,119], [46,77,32], [221,218,144]),
        "pickle": (.367, .066, 5, [.57, .7, .31, .61, .66], [147,149,70], [75,86,40], [191,185,98]),
    }
    for name, (radius, h, count, placements, flesh, skin, seeds) in styles.items():
        material = glb.material(name.capitalize() + " flesh and skin", roughness=.44)
        pieces = []
        for i in range(count):
            angle = .45 + i * TAU / count
            r = radius * (1 + .08 * math.sin(i*5 + 2))
            offset = (placements[i]*math.cos(angle), i % 2 * .016, placements[i]*math.sin(angle))
            profile = [(0,.005),(r*.88,.005),(r*.99,.014),(r,.027),(r,h-.022),
                       (r*.984,h-.009),(r*.94,h),(r*.8,h),(r*.62,h),(r*.30,h),(0,h)]

            def deform(t, rad, y, v):
                wave = .024 * math.sin(5*t+i) + .016*math.cos(9*t-i)
                ridges = .007*math.sin(rad*84 + t*6) if name == "pickle" else 0
                return rad * (1+wave), y + ridges + .012*math.sin(t+angle)*rad/r

            def shade(t, rad, y, v):
                mesocarp = np.clip((r*.958 - rad)*300 + .5, 0, 1)
                chamber = math.sin((5 if name == "tomato" else 3)*t + .25*math.sin(t*11))
                gel = max(0, chamber) * max(0, 1-abs(rad/r - .52)*3)
                kernel = gel * max(0, math.sin(t*43+rad*72))**8
                mottling = 7 * math.cos(rad*71+t*8) * math.sin(t*23-rad*36)
                rgb = np.array(flesh) * mesocarp + np.array(skin) * (1-mesocarp)
                rgb = rgb * (1-gel*.31) + kernel * (np.array(seeds)-rgb)*.7
                return rgb + mottling + 7 * math.sin(t*10)*mesocarp

            pieces.append(lathe(profile,deform,shade,cols=40,rows=18,offset=offset))
        glb.ingredient(name, h + .016, merge(glb, material, pieces))

    onion = glb.material("Red onion rings", roughness=.49)
    pieces = []
    for i, (x,z,r) in enumerate(((.4,.22,.58),(-.35,-.45,.54),(-.52,.38,.43),(.33,-.56,.37))):
        profile = [(r-.082,.011),(r-.083,.037),(r-.072,.054),(r-.026,.062),
                   (r,.055),(r+.007,.04),(r+.005,.014),(r-.007,.008),(r-.082,.011)]

        def shade(t,rad,y,v):
            edge = np.clip((rad-r+.028)/.031,0,1)
            stripe = np.sin(rad*340+t*.08)**8
            return np.array([228,206,192]) - edge * np.array([36,94,49]) - 20*stripe

        def deform(t,rad,y,v):
            return rad * (1+.076*math.sin(t+i)+.019*math.cos(4*t+i)), y+.012*math.cos(t+i)

        pieces.append(lathe(profile,deform,shade,cols=48,rows=12,offset=(x,i*.009,z)))
    glb.ingredient("onion", .083, merge(glb, onion, pieces))


def main():
    glb = Glb()
    bread(glb, False)
    bread(glb, True)
    beef(glb)
    cheese(glb)
    lettuce(glb)
    vegetables(glb)
    output = ROOT / "assets" / "half-pounder.glb"
    output.parent.mkdir(exist_ok=True)
    glb.save(output)
    print(f"{output.name}: {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
