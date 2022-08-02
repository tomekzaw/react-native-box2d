import * as React from 'react';

import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { Box2d } from 'react-native-fast-crypto';
import {
  Skia,
  Canvas,
  Group,
  Rect,
  useClockValue,
  useValue,
  useComputedValue,
} from '@shopify/react-native-skia';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

const { width: screenWidth, height: _screenHeight } = Dimensions.get('window');
// TODO: probably better to do that with onLayout
const screenHeight =
  Platform.select({
    ios: _screenHeight,
    android:
      // note: my hack of getting the correct screen height on android
      Dimensions.get('screen').height -
      StaticSafeAreaInsets.safeAreaInsetsBottom -
      // only needed bc status bar not translucent!
      (StatusBar.currentHeight ?? 0),
  }) ?? 0;
const meterPerScreenWidth = 8;
const mmToPxFactor = screenWidth / meterPerScreenWidth;
const pxToMmFactor = meterPerScreenWidth / screenWidth;

const boxSizeMm = 1;
const boxSizePx = boxSizeMm * mmToPxFactor;

const degreeToRadFactor = Math.PI / 180;
const boxStartAngle = 25 * degreeToRadFactor;

export default function App() {
  const clock = useClockValue();

  const boxWorldPos = useValue({
    y: 4,
    x: meterPerScreenWidth / 2 - boxSizeMm / 2,
    angle: boxStartAngle,
  });

  const boxMatrix = useComputedValue(() => {
    const matrix = Skia.Matrix();

    // important, translate first
    matrix.translate(
      boxWorldPos.current.x * mmToPxFactor,
      boxWorldPos.current.y * mmToPxFactor
    );

    // "Transform origin effect" set to center of box
    matrix.translate(boxSizePx / 2, boxSizePx / 2);
    matrix.rotate(boxWorldPos.current.angle);
    matrix.translate(-(boxSizePx / 2), -(boxSizePx / 2));

    return matrix;
  }, [boxWorldPos]);

  // Reproduction from: https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_hello.html
  React.useEffect(() => {
    const b2vec2 = Box2d.b2Vec2(0, 10); // close to earth gravity
    const world = Box2d.b2World(b2vec2);

    // create ground
    const groundBoxHeight = 1;
    const groundBodyDef = Box2d.b2BodyDef();
    groundBodyDef.position = Box2d.b2Vec2(
      0,
      screenHeight * pxToMmFactor - groundBoxHeight / 2
    );
    const groundBody = world.CreateBody(groundBodyDef);

    // ground polygon
    const groundBox = Box2d.b2PolygonShape();
    groundBox.SetAsBox(meterPerScreenWidth / 2, groundBoxHeight / 2);
    groundBody.CreateFixture2(groundBox, 0);

    // create a dynamic body
    const bodyDef = Box2d.b2BodyDef();
    bodyDef.type = 2;
    bodyDef.position = Box2d.b2Vec2(
      boxWorldPos.current.x,
      boxWorldPos.current.y
    );
    bodyDef.angle = boxWorldPos.current.angle;

    const body = world.CreateBody(bodyDef);
    // attach
    const dynamicBox = Box2d.b2PolygonShape();
    dynamicBox.SetAsBox(boxSizeMm, boxSizeMm);
    // fixture
    const fixtureDef = Box2d.b2FixtureDef();
    fixtureDef.shape = dynamicBox;
    fixtureDef.density = 1;
    fixtureDef.friction = 0.3;

    body.CreateFixture(fixtureDef);

    // Start 🙌
    const timeStep = 1 / 60;
    const velocityIterations = 6;
    const positionIterations = 2;

    const remove = clock.addListener(() => {
      world.Step(timeStep, velocityIterations, positionIterations);
      const pos = body.GetPosition();
      boxWorldPos.current = {
        x: pos.x,
        y: pos.y,
        angle: body.GetAngle(),
      };
      // console.log(
      //   `x: ${boxWorldPos.current.x.toFixed(
      //     2
      //   )}, y: ${boxWorldPos.current.y.toFixed(
      //     2
      //   )}, rotation: ${boxWorldPos.current.angle.toFixed(2)}`
      // );
    });
    clock.start();
    return remove;
  }, [boxWorldPos, clock]);

  return (
    <Canvas style={styles.container}>
      {/* Dynamic box */}
      <Group matrix={boxMatrix}>
        <Rect height={boxSizePx} width={boxSizePx} x={0} y={0} color={'red'} />
      </Group>

      {/* Ground box */}
      <Rect
        height={mmToPxFactor}
        width={screenWidth}
        x={0}
        y={screenHeight - mmToPxFactor}
        color={'lightblue'}
      />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  container: {
    height: screenHeight,
    width: screenWidth,
  },
});
