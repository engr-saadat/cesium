import {
  Cartesian3,
  Cesium3DTilesVoxelProvider,
  ClippingPlane,
  ClippingPlaneCollection,
  VoxelPrimitive,
  buildVoxelDrawCommands,
} from "../../index.js";
import createScene from "../../../../Specs/createScene.js";
import pollToPromise from "../../../../Specs/pollToPromise.js";

describe("Scene/VoxelDrawCommands", function () {
  let scene;
  let provider;

  beforeAll(function () {
    scene = createScene();

    provider = new Cesium3DTilesVoxelProvider({
      url: "./Data/Cesium3DTiles/Voxel/VoxelEllipsoid3DTiles/tileset.json",
    });

    return pollToPromise(function () {
      provider.update(scene.frameState);
      return provider.ready;
    });
  });

  afterAll(function () {
    scene.destroyForSpecs();
  });

  it("sets up basic voxel draw commands", function () {
    const primitive = new VoxelPrimitive({ provider });
    primitive.update(scene.frameState);

    buildVoxelDrawCommands(primitive, scene.context);
    expect(primitive._drawCommand).toBeDefined();
    expect(primitive._drawCommandPick).toBeDefined();
  });

  it("adds clipping function for primitive with clipping planes", function () {
    const primitive = new VoxelPrimitive({ provider });

    const planes = [
      new ClippingPlane(Cartesian3.UNIT_X, 1.0),
      new ClippingPlane(Cartesian3.UNIT_Y, 2.0),
    ];

    primitive.clippingPlanes = new ClippingPlaneCollection({
      planes: planes,
    });

    primitive.update(scene.frameState);

    buildVoxelDrawCommands(primitive, scene.context);

    const { shaderProgram } = primitive._drawCommand;
    const fragmentShaderText = shaderProgram._fragmentShaderText;
    const clippingFunctionSignature =
      "vec4 getClippingPlane(highp sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform)";

    expect(fragmentShaderText.includes(clippingFunctionSignature)).toBe(true);
  });
});