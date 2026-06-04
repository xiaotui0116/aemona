function triggerFlow(text, spawnX, spawnY, world) {
  const letters = Array.from(text);
  const total = Math.max(letters.length, 1);

  gsap.fromTo(
    '.faucet-mark',
    { rotate: 0, scale: 1 },
    { rotate: -7, scale: 1.06, yoyo: true, repeat: 3, duration: 0.22, ease: 'sine.inOut' }
  );

  gsap.fromTo(
    '#canvas',
    { filter: 'brightness(1)' },
    { filter: 'brightness(1.025)', yoyo: true, repeat: 1, duration: 0.38, ease: 'sine.out' }
  );

  for (let i = 0; i < total * 4; i++) {
    setTimeout(() => {
      const droplet = createDroplet(
        spawnX + (Math.random() - 0.5) * 34,
        spawnY + Math.random() * 14,
        i
      );

      World.add(world, droplet);
    }, i * 42);
  }

  letters.forEach((char, index) => {
    setTimeout(() => {
      const body = createCharBody(
        char,
        spawnX + (index - (total - 1) / 2) * 4 + (Math.random() - 0.5) * 18,
        spawnY + Math.random() * 18,
        index
      );

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2.6,
        y: 1.4 + Math.random() * 2.2
      });

      World.add(world, body);
    }, index * 95);
  });
}
