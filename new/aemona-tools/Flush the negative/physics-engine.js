const { Engine, World, Bodies, Body } = Matter;

const engine = Engine.create();
engine.gravity.y = 0.55;

const RELEASE_PALETTE = [
  '#A46E58',
  '#7D918A',
  '#6F8796',
  '#B79A59',
  '#A67A86',
  '#7E6C96'
];

function createCharBody(char, x, y, index = 0) {
  const body = Bodies.circle(x, y, 10 + Math.random() * 4, {
    restitution: 0.36,
    frictionAir: 0.018 + Math.random() * 0.018,
    friction: 0.02,
    char,
    label: 'charParticle',
    renderInfo: {
      born: performance.now(),
      color: RELEASE_PALETTE[index % RELEASE_PALETTE.length],
      size: 17 + Math.random() * 8,
      spin: (Math.random() - 0.5) * 0.04,
      drift: (Math.random() - 0.5) * 0.28,
      dissolve: 5200 + Math.random() * 1800
    }
  });

  Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
  return body;
}

function createDroplet(x, y, index = 0) {
  const body = Bodies.circle(x, y, 3 + Math.random() * 4, {
    restitution: 0.14,
    frictionAir: 0.024,
    isSensor: true,
    label: 'waterParticle',
    renderInfo: {
      born: performance.now(),
      color: RELEASE_PALETTE[(index + 2) % RELEASE_PALETTE.length],
      size: 3 + Math.random() * 5,
      dissolve: 1800 + Math.random() * 1200
    }
  });

  Body.setVelocity(body, {
    x: (Math.random() - 0.5) * 1.8,
    y: 1.5 + Math.random() * 2.4
  });

  return body;
}

function renderChars(ctx, bodies, width, height) {
  const now = performance.now();

  bodies.slice().forEach((body) => {
    if (body.label !== 'charParticle' && body.label !== 'waterParticle') {
      return;
    }

    const info = body.renderInfo || {};
    const age = now - (info.born || now);
    const life = Math.max(0, 1 - age / (info.dissolve || 4000));
    const depth = Math.min(body.position.y / Math.max(height, 1), 1);

    if (life <= 0 || body.position.y > height + 90 || body.position.x < -90 || body.position.x > width + 90) {
      World.remove(engine.world, body);
      return;
    }

    if (body.label === 'waterParticle') {
      ctx.save();
      ctx.globalAlpha = life * 0.28;
      ctx.fillStyle = info.color || '#7D918A';
      ctx.beginPath();
      ctx.ellipse(
        body.position.x,
        body.position.y,
        (info.size || 4) * (1 + depth * 0.8),
        (info.size || 4) * 0.42,
        body.angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle + (info.spin || 0) * age);
    ctx.globalAlpha = Math.min(0.86, life * 1.2) * (1 - depth * 0.22);
    ctx.fillStyle = info.color || '#513D35';
    ctx.font = `400 ${info.size || 20}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(body.char, 0, 0);
    ctx.restore();

    Body.applyForce(body, body.position, {
      x: (info.drift || 0) * 0.00008,
      y: 0.00004
    });
  });
}
