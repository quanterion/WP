import { mat4 } from '../geometry/mat4';
import { quat } from '../geometry/quat';
import { Entity } from '../designer';
import { MatrixInterpolator } from '../interpolator';

describe('Interpolator', () => {
  it('simpleTest', () => {
    let anim = new MatrixInterpolator();
    let e = new Entity(undefined);
    e.rotate([0, 0, 0], [1, 0, 0], 0.1);
    anim.setSource(e.matrix);
    e.rotate([0, 0, 0], [1, 0, 0], -0.2);
    anim.setDestination(e.matrix);

    let m = anim.interpolate(mat4.create(), 0.5);
    expect(mat4.compare(m, mat4.createIdentity())).toBeTruthy();
  });

  it('advTest', () => {
    let anim = new MatrixInterpolator();
    let e = new Entity(undefined);
    e.rotate([0, 0, 0], [1, 0, 0], 0.1);
    anim.setSource(
      mat4.normalizeOrthoMatrix(mat4.create(), [
        -0.344003757898774,
        0.11554635490555432,
        0.9316497011102348,
        0,
        0.13842559763959184,
        0.9877968373710262,
        -0.07136302511859287,
        0,
        -0.9285259714347639,
        0.10441919030520576,
        -0.35580034600990884,
        0,
        -5734.392820204383,
        430.17676881558,
        -3230.91712167312,
        1
      ])
    );
    let dest = [
      -0.3207162613393846,
      0.11558557180022042,
      0.9402767992994746,
      0,
      0.45402720105145605,
      0.8902066916913574,
      0.04546633069141376,
      0,
      -0.8317854469478988,
      0.4414930349957325,
      -0.3379827556249405,
      0,
      -4849.295546651179,
      3493.4984382950565,
      -3066.758223742428,
      1
    ];
    let ddnorm = mat4.normalizeOrthoMatrix(mat4.create(), dest);
    anim.setDestination(ddnorm);
    let m = anim.interpolate(mat4.create(), 1.0, /*test*/ true);
    expect(mat4.compare(m, ddnorm)).toBeTruthy();
  });
});
