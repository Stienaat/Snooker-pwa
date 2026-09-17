const TABLE_LENGTH = 3569;
const TABLE_WIDTH = 1778;
const BALL_RADIUS = 26.25;
const BALL_VALUES = { red: 1, yellow: 2, green: 3, brown: 4, blue: 5, pink: 6, black: 7 };
const COLOR_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
const POCKETS = [
  { x: 0, y: 0 }, { x: TABLE_LENGTH / 2, y: 0 }, { x: TABLE_LENGTH, y: 0 },
  { x: 0, y: TABLE_WIDTH }, { x: TABLE_LENGTH / 2, y: TABLE_WIDTH }, { x: TABLE_LENGTH, y: TABLE_WIDTH }
];
const PHONE_LEVELS = {
  novice:   { label: 'NOVICE',    angleError: .075, powerError: .18, choiceNoise: 1050, valueWeight: 0 },
  basic:    { label: 'BASIC',     angleError: .038, powerError: .10, choiceNoise: 520,  valueWeight: 12 },
  advanced: { label: 'GEVORDERD', angleError: .018, powerError: .05, choiceNoise: 120,  valueWeight: 35 },
  expert:   { label: 'EXPERT',    angleError: .007, powerError: .022, choiceNoise: 0,   valueWeight: 95 }
};

const TRAINING_GUIDES = [
  {
    demo: 'DEMO 1',
    category: 'EFFECTEN',
    name: 'STOPBAL',
    instruction:
      'Raak de rode bal vol en kies het raakpunt net onder het centrum.',
    result:
      'Wit stopt vrijwel op het contactpunt; rood loopt door.',
    topSpin: -.04,
    sideSpin: 0,
    power: .42,
    powerName: 'MIDDEL',
    aimAngle: 0
  },
  {
    demo: 'DEMO 2',
    category: 'EFFECTEN',
    name: 'DOORLOOPBAL',
    instruction:
      'Raak de rode bal volgens de lijn en geef duidelijke topspin.',
    result:
      'Wit blijft na de botsing vooruit rollen.',
    topSpin: .55,
    sideSpin: 0,
    power: .5,
    powerName: 'MIDDEL',
    aimAngle: 0
  },
  {
    demo: 'DEMO 3',
    category: 'EFFECTEN',
    name: 'TREKBAL',
    instruction:
      'Raak de rode bal vrij vol en geef duidelijke backspin.',
    result:
      'Wit keert na de botsing terug.',
    topSpin: -.62,
    sideSpin: 0,
    power: .62,
    powerName: 'STEVIG',
    aimAngle: 0
  },
  {
    demo: 'DEMO 4',
    category: 'RICHTEN',
    name: 'RECHTE BAL',
    instruction:
        'Raak om de rode bal recht naar de bovenste middenpocket te spelen.',
    result:
      'Wit, rood en de middenpocket liggen exact op één rechte lijn.',
    topSpin: 0,
    sideSpin: 0,
    power: .48,
    powerName: 'MIDDEL',
    aimAngle: -Math.PI / 2
  },
  {
    demo: 'DEMO 5',
    category: 'RICHTEN',
    name: 'SCHUINE POT',
    instruction:
      'Raak de rode bal schuin naar de bovenste middenpocket.',
    result:
      'De rode voorspelling moet precies in de middenpocket eindigen.',
    topSpin: 0,
    sideSpin: 0,
    power: .56,
    powerName: 'middel',
    aimAngle: -2.465
  },
  {
    demo: 'DEMO 6',
    category: 'RICHTEN',
    name: 'HALVE BAL',
    instruction:
      'Richt de hartlijn van wit ongeveer naar de buitenzijde van rood.',
    result:
      'Rood vertrekt onder een duidelijke hoek naar de bovenste middenpocket.',
    topSpin: 0,
    sideSpin: 0,
    power: .52,
    powerName: 'MIDDEL',
    aimAngle: -1.52
  },
  {
    demo: 'DEMO 7',
    category: 'RICHTEN',
    name: 'DUNNE BAL',
    instruction:
      'Raak slechts een klein gedeelte van rood.',
    result:
      'Rood loopt naar de bovenste middenpocket en wit wijkt sterk af.',
    topSpin: 0,
    sideSpin: 0,
    power: .62,
    powerName: 'STEVIG',
    aimAngle: -1.17
  },
  {
    demo: 'DEMO 8',
    category: 'RICHTEN',
    name: 'DIKKE BAL',
    instruction:
      'Raak rood bijna vol, maar niet exact in het midden.',
    result:
      'Rood krijgt veel snelheid; wit wijkt slechts beperkt af.',
    topSpin: 0,
    sideSpin: 0,
    power: .46,
    powerName: 'MIDDEL',
    aimAngle: -2.215
  },

  {
    demo: 'DEMO 9',
    category: 'KRACHT',
    name: 'ZACHTE STOOT',
    instruction:
      'Raak rood vol met weinig kracht.',
    result:
      'Rood rolt slechts een beperkte afstand en wit blijft dichtbij.',
    topSpin: 0,
    sideSpin: 0,
    power: .25,
    powerName: 'ZACHT',
    aimAngle: 0
  },

  {
    demo: 'DEMO 10',
    category: 'KRACHT',
    name: 'MIDDELHARD',
    instruction:
      'Raak rood vol met gemiddelde kracht.',
    result:
      'Rood legt duidelijk meer afstand af dan bij de zachte stoot.',
    topSpin: 0,
    sideSpin: 0,
    power: .48,
    powerName: 'MIDDEL',
    aimAngle: 0
  },

  {
    demo: 'DEMO 11',
    category: 'KRACHT',
    name: 'HARDE STOOT',
    instruction:
      'Raak rood vol met veel kracht.',
    result:
      'Rood legt een grote afstand af en kan meerdere banden bereiken.',
    topSpin: 0,
    sideSpin: 0,
    power: .80,
    powerName: 'HARD',
    aimAngle: 0
  },

  {
    demo: 'DEMO 12',
    category: 'POSITIESPEL',
    name: 'POSITIE VOOR BLAUW',
  instruction:
  'Pot rood en houd een speelbare positie voor blauw.',
  result:
  'Rood valt in de middenpocket en wit stopt in de doelcirkel.',
    topSpin: -.04,
    sideSpin: 0,
    power: .48,
    powerName: 'MIDDEL',
    aimAngle: -1.795,
    target: {
      x: 2230,
      y: 560,
      radius: 170
    }
  },

  {
    demo: 'DEMO 13',
    category: 'POSITIESPEL',
    name: 'POSITIE VOOR ZWART',
    instruction:
      'Pot rood en houd een speelbare positie voor zwart.',
    result:
      'Rood valt in de hoekpocket en wit stopt in de doelcirkel.',
    topSpin: -.04,
    sideSpin: 0,
    power: .55,
    powerName: 'MIDDEL',
    aimAngle: .907,
    target: {
      x: 3000,
      y: 1050,
      radius: 170
    }
  },
  {
    demo: 'DEMO 14',
    category: 'POSITIESPEL',
    name: 'POSITIE VOOR ROZE',
    instruction:
      'Pot rood met een stopbal en houd wit speelbaar voor roze.',
    result:
      'Rood valt in de hoekpocket en wit stopt in de doelcirkel.',
    topSpin: -.04,
    sideSpin: 0,
    power: .55,
    powerName: 'MIDDEL',
    aimAngle: -.695,
    target: {
      x: 2810,
      y: 634,
      radius: 150
    }
  },
  {
    demo: 'DEMO 15',
    category: 'POSITIESPEL',
    name: 'DOORLOOP NAAR ROOD',
    instruction:
      'Pot de eerste rode bal met topspin.',
    result:
      'Wit loopt door naar de doelcirkel en blijft speelbaar voor de tweede rode bal.',
    topSpin: .28,
    sideSpin: 0,
    power: .42,
    powerName: 'MIDDEL',
    aimAngle: -Math.PI / 2,
    target: {
      x: TABLE_LENGTH / 2,
      y: 230,
      radius: 120
    }
  },
  {
    demo: 'DEMO 16',
    category: 'POSITIESPEL',
    name: 'TREKBAL NAAR ROOD',
    instruction:
      'Pot de eerste rode bal met duidelijke backspin.',
    result:
      'Wit trekt terug naar de doelcirkel en blijft speelbaar voor de tweede rode bal.',
    topSpin: -.35,
    sideSpin: 0,
    power: .50,
    powerName: 'MIDDEL',
    aimAngle: -Math.PI / 2,
    target: {
      x: TABLE_LENGTH / 2,
      y: 950,
      radius: 120
    }
  },
  {
    demo: 'DEMO 17',
    category: 'POSITIESPEL',
    name: 'POSITIE VIA ÉÉN BAND',
    instruction:
      'Pot rood met sterke topspin en stuur wit via de onderband.',
    result:
      'Wit raakt één band en eindigt daarna in de doelcirkel.',
    topSpin: .80,
    sideSpin: 0,
    power: .60,
    powerName: 'STEVIG',
    aimAngle: 2.409,
    target: {
      x: 1060,
      y: 1600,
      radius: 150
    }
  },
  {
    demo: 'DEMO 18',
      category: 'BANDEN',
      name: 'ÉÉN BAND ZONDER EFFECT',
      instruction:
        'Pot rood en laat wit zonder effect tegen de onderband lopen.',
      result:
        'Wit kaatst volgens de natuurlijke bandhoek naar de doelcirkel.',
      topSpin: 0,
      sideSpin: 0,
      power: .50,
      powerName: 'MIDDEL',
      aimAngle: 1.742,
      target: {
        x: 2860,
        y: 1465,
        radius: 140
      }  
  },   
  {
    demo: 'DEMO 19',
        category: 'BANDEN',
        name: 'LINKS EFFECT',
        instruction:
          'Pot rood en raak wit volledig links met de pomerans.',
        result:
          'Na de onderband loopt wit verder naar rechts dan zonder effect.',
        topSpin: 0,
        sideSpin: -1,
        power: .60,
        powerName: 'STEVIG',
        aimAngle: 1.742,
        target: {
          x: 3200,
          y: 1270,
          radius: 80
        }
  },
  { 
    demo: 'DEMO 20',
        category: 'BANDEN',
        name: 'RECHTS EFFECT',
        instruction:
          'Pot rood en raak wit volledig rechts met de pomerans.',
        result:
          'Na de onderband loopt wit minder ver naar rechts dan zonder effect.',
        topSpin: 0,
        sideSpin: 1,
        power: .60,
        powerName: 'STEVIG',
        aimAngle: 1.742,
        target: {
          x: 3085,
          y: 1270,
          radius: 80
        }
  },
  {
    demo: 'DEMO 21',
        category: 'BANDEN',
        name: 'TWEE BANDEN',
        instruction:
          'Pot rood en laat wit zonder effect via twee banden lopen.',
        result:
          'Wit raakt eerst de onderband, daarna de rechterband en eindigt in de doelcirkel.',
        topSpin: 0,
        sideSpin: 0,
        power: .78,
        powerName: 'HARD',
        aimAngle: 1.742,
        target: {
          x: 3450,
          y: 860,
          radius: 100
        }
  },
  {
    demo: 'DEMO 22',
        category: 'VERDEDIGEN',
        name: 'AFSTAND CREËREN',
        instruction:
          'Raak rood en trek wit terug naar de baulk.',
        result:
          'Rood en wit eindigen zo ver mogelijk uit elkaar.',
        topSpin: -.75,
        sideSpin: 0,
        power: .90,
        powerName: 'HARD',
        aimAngle: -.359,
        requiresRedPot: false,
        target: {
          x: 540,
          y: 1600,
          radius: 180
        }
  },
  {
    demo: 'DEMO 23',
        category: 'VERDEDIGEN',
        name: 'SNOOKER ACHTER GEEL',
        instruction: 'Raak rood dun en stuur wit via de band achter geel.',
        result: 'Geel ontneemt vanuit de eindpositie het zicht op rood.',
        topSpin: 0,
        sideSpin: 0,
        power: .72,
        powerName: 'MIDDELHARD',
        aimAngle: -2.84,
        requiresRedPot: false,
        target: {
          x: 535,
          y: 1180,
          radius: 145
        }
  },
  {
    demo: 'DEMO 24',
        category: 'ONTSNAPPEN',
        name: 'VIA ÉÉN BAND',
        instruction: 'Speel wit via de onderste band en raak rood.',
        result: 'Wit raakt eerst één band en daarna de rode bal.',
        topSpin: 0,
        sideSpin: 0,
        power: .50,
        powerName: 'MIDDELHARD',
        aimAngle: .769,
        requiresRedPot: false
  },
  {
   demo: 'DEMO 25',
        category: 'ONTSNAPPEN',
        name: 'VIA TWEE BANDEN',
        instruction: 'Speel via de onderste en bovenste band naar rood.',
        result: 'Wit raakt twee banden voordat rood wordt geraakt.',
        topSpin: 0,
        sideSpin: 0,
        power: .86,
        powerName: 'HARD',
        aimAngle: 1.262,
        requiresRedPot: false
  },
  {
    demo: 'DEMO 26',
        category: 'VERDEDIGEN',
        name: 'DUNNE SAFETY',
        instruction: 'Raak rood uiterst dun en laat wit naar de baulk lopen.',
        result: 'Rood blijft ver weg en wit eindigt veilig in de baulk.',
        topSpin: 0,
        sideSpin: 0,
        power: .55,
        powerName: 'MIDDEL',
        aimAngle: 3.080,
        requiresRedPot: false,
        target: {
          x: 400,
          y: 1470,
          radius: 140
        }                
  },
  {
    demo: 'DEMO 27',
          category: 'VERDEDIGEN',
          name: 'WIT TEGEN DE BAND',
          instruction: 'Raak rood dun en laat wit tegen de lange band eindigen.',
          result: 'Wit stopt dicht tegen de band en bemoeilijkt de volgende stoot.',
          topSpin: 0,
          sideSpin: 0,
          power: .33,
          powerName: 'ZACHT',
          aimAngle: 2.602,
          requiresRedPot: false,
          target: {
            x: 1300,
            y: 1765,
            radius: 145
          }
  },
  {
    demo: 'DEMO 28',
            category: 'VERDEDIGEN',
            name: 'SNOOKER VIA DE BAND',
            instruction: 'Raak rood dun en stuur wit via de band achter geel.',
            result: 'Geel blokkeert vanuit de eindpositie het zicht op rood.',
            topSpin: 0,
            sideSpin: 0,
            power: .52,
            powerName: 'MIDDEL',
            aimAngle: 2.412,
            requiresRedPot: false,
            target: {
              x: 520,
              y: 1181,
              radius: 150
            }
  },
  {
    demo: 'DEMO 29',
            category: 'POSITIESPEL',
            name: 'RODEN OPENBREKEN',
            instruction: 'Raak de voorste rode vol en gebruik backspin.',
            result: 'De groep wordt geopend en wit komt gecontroleerd terug.',
            topSpin: -.35,
            sideSpin: 0,
            power: .56,
            powerName: 'MIDDEL',
            aimAngle: 0,
            requiresRedPot: false,
            target: {
              x: 1450,
              y: 889,
              radius: 180
            }
  },
  {
    demo: 'DEMO 30',
            category: 'POSITIESPEL',
            name: 'KLEUR NAAR ROOD',
            instruction: 'Pot blauw en trek wit terug naar de rode bal.',
            result: 'Blauw valt en wit eindigt speelbaar voor rood.',
            topSpin: -.65,
            sideSpin: 0,
            power: .48,
            powerName: 'MIDDEL',
            aimAngle: -1.570796,
            requiresRedPot: false,
            target: {
              x: 1785,
              y: 1400,
              radius: 145
            }
  },
  {
    demo: 'DEMO 31',
            category: 'POSITIESPEL',
            name: 'ROOD NAAR KLEUR',
            instruction: 'Pot rood schuin en laat wit doorlopen naar blauw.',
            result: 'Rood valt en wit eindigt speelbaar voor blauw.',
            topSpin: 0,
            sideSpin: 0,
            power: .35,
            powerName: 'ZACHT',
            aimAngle: -2.550,
            requiresRedPot: true,
            target: {
              x: 1050,
              y: 350,
              radius: 145
            }
  },
  {
    demo: 'DEMO 32',
            category: 'LANGE STOOT',
            name: 'LANGE POT',
            instruction: 'Pot rood over grote afstand en houd wit onder controle.',
            result: 'Rood valt en wit blijft centraal speelbaar.',
            topSpin: -.20,
            sideSpin: 0,
            power: .95,
            powerName: 'MAXIMAAL',
            aimAngle: -0.4851024,
            requiresRedPot: true,
            target: {
              x: 2770,
              y: 425,
              radius: 155
            }
  },
  {
    demo: 'DEMO 33',
    category: 'CANNON',
    name: 'ROOD VIA CANNON',
    instruction: 'Pot rood en laat wit daarna blauw raken.',
    result: 'Rood valt; wit raakt blauw en blijft daar speelbaar.',
    topSpin: 0,
    sideSpin: 0,
    power: .35,
    powerName: 'ZACHT',
    aimAngle: -2.548,
    requiresRedPot: true,
    requiredSecondContact: 'blue',
    target: {
      x: 1280,
      y: 350,
      radius: 150
    }
  }   

];

const COLOR_SPOTS = {
  yellow: { x: 737, y: TABLE_WIDTH / 2 + 292 },
  green: { x: 737, y: TABLE_WIDTH / 2 - 292 },
  brown: { x: 737, y: TABLE_WIDTH / 2 },
  blue: { x: TABLE_LENGTH * .5, y: TABLE_WIDTH / 2 },
  pink: { x: TABLE_LENGTH * .75, y: TABLE_WIDTH / 2 },
  black: { x: TABLE_LENGTH - 324, y: TABLE_WIDTH / 2 }
};

function predictedCueApproach(
  white,
  startVx,
  startVy,
  balls,
  initialSideSpin = 0
) {
  const points = [{ x: white.x, y: white.y }];
  const drag = -Math.log(.44);
  const cushionRestitution = .83;

  let x = white.x;
  let y = white.y;
  let vx = startVx;
  let vy = startVy;
  let sideSpin = initialSideSpin;

  for (let bounce = 0; bounce < 10; bounce += 1) {
    const speed = Math.hypot(vx, vy);
    if (speed < 7) break;

    const ux = vx / speed;
    const uy = vy / speed;
    const walls = [];

    if (ux > 0) {
      walls.push({
        distance:
          (TABLE_LENGTH - BALL_RADIUS - x) / ux,
        wall: 'right'
      });
    }

    if (ux < 0) {
      walls.push({
        distance:
          (BALL_RADIUS - x) / ux,
        wall: 'left'
      });
    }

    if (uy > 0) {
      walls.push({
        distance:
          (TABLE_WIDTH - BALL_RADIUS - y) / uy,
        wall: 'bottom'
      });
    }

    if (uy < 0) {
      walls.push({
        distance:
          (BALL_RADIUS - y) / uy,
        wall: 'top'
      });
    }

    const edge = walls
      .filter((item) => item.distance > .01)
      .sort((a, b) => a.distance - b.distance)[0];

    const stopDistance = Math.max(
      0,
      (speed - 7) / drag
    );

    const maximumTravel = Math.min(
      stopDistance,
      edge?.distance ?? Infinity
    );

    /*
     * Zoek de eerste objectbal op dit deel van de baan.
     * Voor een botsing moeten de middelpunten elkaar tot
     * tweemaal de balstraal naderen.
     */
    let nearestBall = null;
    const collisionRadius = BALL_RADIUS * 2;

    for (const ball of balls) {
      if (
        ball === white ||
        ball.kind === 'white' ||
        ball.potted
      ) continue;

      const offsetX = ball.x - x;
      const offsetY = ball.y - y;
      const projection =
        offsetX * ux + offsetY * uy;

      if (projection <= .01) continue;

      const perpendicularSquared =
        offsetX * offsetX +
        offsetY * offsetY -
        projection * projection;

      if (
        perpendicularSquared >
        collisionRadius * collisionRadius
      ) continue;

      const entryDistance =
        projection -
        Math.sqrt(
          Math.max(
            0,
            collisionRadius * collisionRadius -
            perpendicularSquared
          )
        );

      if (
        entryDistance > .01 &&
        entryDistance <= maximumTravel &&
        (
          !nearestBall ||
          entryDistance < nearestBall.distance
        )
      ) {
        nearestBall = {
          ball,
          distance: entryDistance
        };
      }
    }

    const pocketHit = predictedPocketHit(
      x,
      y,
      ux,
      uy,
      maximumTravel
    );

    if (
      pocketHit &&
      (
        !nearestBall ||
        pocketHit.distance < nearestBall.distance
      )
    ) {
      points.push({
        x: pocketHit.pocket.x,
        y: pocketHit.pocket.y
      });

      return {
        points,
        hit: null,
        potted: true
      };
    }

    if (nearestBall) {
      const contactX =
        x + ux * nearestBall.distance;
      const contactY =
        y + uy * nearestBall.distance;

      points.push({
        x: contactX,
        y: contactY
      });

      return {
        points,
        hit: {
          ball: nearestBall.ball,
          contactX,
          contactY,
          directionX: ux,
          directionY: uy,
          impactSpeed: Math.max(
            0,
            speed - drag * nearestBall.distance
          ),
          sideSpin
        },
        potted: false
      };
    }

    if (!edge || stopDistance <= edge.distance) {
      x += ux * stopDistance;
      y += uy * stopDistance;
      points.push({ x, y });

      return {
        points,
        hit: null,
        potted: false
      };
    }

    x += ux * edge.distance;
    y += uy * edge.distance;
    points.push({ x, y });

    const speedAtWall = Math.max(
      7,
      speed - drag * edge.distance
    );

    vx = ux * speedAtWall;
    vy = uy * speedAtWall;

    const speedRatio = Math.max(
      .0001,
      Math.min(1, speedAtWall / speed)
    );

    const travelTime =
      -Math.log(speedRatio) / drag;

    sideSpin *= Math.pow(.52, travelTime);

    if (edge.wall === 'left') {
      vx = Math.abs(vx) * cushionRestitution;
      vy -= sideSpin * Math.abs(vx) * .18;
      x = BALL_RADIUS + .02;
    } else if (edge.wall === 'right') {
      vx = -Math.abs(vx) * cushionRestitution;
      vy += sideSpin * Math.abs(vx) * .18;
      x = TABLE_LENGTH - BALL_RADIUS - .02;
    } else if (edge.wall === 'top') {
      vy = Math.abs(vy) * cushionRestitution;
      vx += sideSpin * Math.abs(vy) * .18;
      y = BALL_RADIUS + .02;
    } else {
      vy = -Math.abs(vy) * cushionRestitution;
      vx -= sideSpin * Math.abs(vy) * .18;
      y = TABLE_WIDTH - BALL_RADIUS - .02;
    }
  }

  return {
    points,
    hit: null,
    potted: false
  };
}

function drawTablePath(ctx, g, points) {
  if (!points || points.length < 2) return;

  ctx.beginPath();

  ctx.moveTo(
    g.x + points[0].x * g.scale,
    g.y + points[0].y * g.scale
  );

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(
      g.x + points[index].x * g.scale,
      g.y + points[index].y * g.scale
    );
  }

  ctx.stroke();
}

function predictedBallPath(
  startX,
  startY,
  startVx,
  startVy,
  initialSideSpin = 0
) {
  const points = [{ x: startX, y: startY }];
  const drag = -Math.log(.44);
  const cushionRestitution = .83;

  let x = startX;
  let y = startY;
  let vx = startVx;
  let vy = startVy;
  let sideSpin = initialSideSpin;

  for (let bounce = 0; bounce < 10; bounce += 1) {
    const speed = Math.hypot(vx, vy);
    if (speed < 7) break;

    const ux = vx / speed;
    const uy = vy / speed;
    const distances = [];

    if (ux > 0) {
      distances.push({
        distance:
          (TABLE_LENGTH - BALL_RADIUS - x) / ux,
        wall: 'right'
      });
    }

    if (ux < 0) {
      distances.push({
        distance:
          (BALL_RADIUS - x) / ux,
        wall: 'left'
      });
    }

    if (uy > 0) {
      distances.push({
        distance:
          (TABLE_WIDTH - BALL_RADIUS - y) / uy,
        wall: 'bottom'
      });
    }

    if (uy < 0) {
      distances.push({
        distance:
          (BALL_RADIUS - y) / uy,
        wall: 'top'
      });
    }

    const edge = distances
      .filter((item) => item.distance > .01)
      .sort((a, b) => a.distance - b.distance)[0];

    const stopDistance = Math.max(
      0,
      (speed - 7) / drag
    );

    const maximumTravel = Math.min(
      stopDistance,
      edge?.distance ?? Infinity
    );

    const pocketHit = predictedPocketHit(
      x,
      y,
      ux,
      uy,
      maximumTravel
    );

    if (pocketHit) {
      points.push({
        x: pocketHit.pocket.x,
        y: pocketHit.pocket.y
      });

      break;
    }

    if (!edge || stopDistance <= edge.distance) {
      x += ux * stopDistance;
      y += uy * stopDistance;
      points.push({ x, y });
      break;
    }

    x += ux * edge.distance;
    y += uy * edge.distance;
    points.push({ x, y });

    const speedAtWall = Math.max(
      7,
      speed - drag * edge.distance
    );

    vx = ux * speedAtWall;
    vy = uy * speedAtWall;

    const speedRatio = Math.max(
      .0001,
      Math.min(1, speedAtWall / speed)
    );

    const travelTime =
      -Math.log(speedRatio) / drag;

    sideSpin *= Math.pow(.52, travelTime);

    if (edge.wall === 'left') {
      vx = Math.abs(vx) * cushionRestitution;
      vy -= sideSpin * Math.abs(vx) * .18;
      x = BALL_RADIUS + .02;
    } else if (edge.wall === 'right') {
      vx = -Math.abs(vx) * cushionRestitution;
      vy += sideSpin * Math.abs(vx) * .18;
      x = TABLE_LENGTH - BALL_RADIUS - .02;
    } else if (edge.wall === 'top') {
      vy = Math.abs(vy) * cushionRestitution;
      vx += sideSpin * Math.abs(vy) * .18;
      y = BALL_RADIUS + .02;
    } else {
      vy = -Math.abs(vy) * cushionRestitution;
      vx -= sideSpin * Math.abs(vy) * .18;
      y = TABLE_WIDTH - BALL_RADIUS - .02;
    }
  }

  return points;
}
const GAME_SOUND_URLS = {
  ball: './assets/sounds/ball_hit.wav',
  cushion: './assets/sounds/cushion_hit.wav',
  pocket: './assets/sounds/pocket_drop.wav'
};

const gameSoundBuffers = {};
let gameAudioContext = null;
let gameAudioLoading = null;

function unlockGameAudio() {
  try {
    if (!gameAudioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      gameAudioContext = new AudioContextClass({
        latencyHint: 'interactive'
      });
    }

    if (gameAudioContext.state === 'suspended') {
      gameAudioContext.resume().catch(() => {});
    }

    if (!gameAudioLoading) {
      gameAudioLoading = Promise.all(
        Object.entries(GAME_SOUND_URLS).map(async ([name, url]) => {
          if (gameSoundBuffers[name]) return;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Geluid niet gevonden: ${url}`);
          }

          const data = await response.arrayBuffer();

          gameSoundBuffers[name] =
            await gameAudioContext.decodeAudioData(data);
        })
      ).catch((error) => {
        gameAudioLoading = null;
        console.warn('Geluiden laden mislukt:', error);
      });
    }
  } catch (error) {
    console.warn('Audio starten mislukt:', error);
  }
}

function playGameSound(name, volume = 1) {
  const buffer = gameSoundBuffers[name];

  if (
    !buffer ||
    !gameAudioContext ||
    gameAudioContext.state !== 'running'
  ) return;

  try {
    const source = gameAudioContext.createBufferSource();
    const gain = gameAudioContext.createGain();

    source.buffer = buffer;
    if (name === 'cushion') volume *= .4;
    gain.gain.value = Math.max(0, Math.min(1, volume));

    source.connect(gain);
    gain.connect(gameAudioContext.destination);

    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };

    source.start();
  } catch (error) {
    console.warn('Geluid afspelen mislukt:', error);
  }
}

export class SnookerTable {
  constructor(canvas, onStateChange = () => {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStateChange = onStateChange;
    this.mode = null;
    this.balls = [];
    this.potAnimations = [];
    this.whitePotted = false;
    this.score = 0;
    this.phoneScore = 0;
    this.breakScore = 0;
    this.currentPlayer = 'human';
    this.phoneTimer = 0;
    this.phoneLevel = 'advanced';
    this.phoneSequenceActive = false;
    this.online = null;
    this.remoteOnlineShot = false;
    this.lastOnlineFrameAt = 0;
    this.lastOnlineCueAt = 0;
    this.remoteCueReceived = false;
    this.remoteCueLocked = false;
    this.rulePhase = 'red';
    this.clearanceIndex = 0;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.statusMessage = 'FAUL OF GEEN POT';
    this.guideVisible = true;
    this.guideMode = 'normal';
    this.trainingScenario = 0;
    this.effectSelectorOpen = false;
    this.topSpin = 0;
    this.sideSpin = 0;
    this.phase = 'idle';
    this.aimAngle = 0;
    this.power = 0;
    this.pointer = null;
    this.lastTime = 0;
    this.animationFrame = 0;
    this.bindControls();
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(bounds.width * dpr);
    this.canvas.height = Math.round(bounds.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = bounds.width;
    this.height = bounds.height;
    this.draw();
  }

  showEmptyTable() {
    cancelAnimationFrame(this.animationFrame);
    this.mode = null;
    this.balls = [];
    this.potAnimations = [];
    this.whitePotted = false;
    this.score = 0;
    this.phoneScore = 0;
    this.breakScore = 0;
    this.currentPlayer = 'human';
    clearTimeout(this.phoneTimer);
    this.phoneSequenceActive = false;
    this.rulePhase = 'red';
    this.clearanceIndex = 0;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.statusMessage = 'FAUL OF GEEN POT';
    this.guideVisible = true;
    this.effectSelectorOpen = false;
    this.topSpin = 0;
    this.sideSpin = 0;
    this.setPhase('idle');
    this.draw();
  }

  start(mode, level = null) {
    this.mode = mode;
    if (mode === 'computer' && PHONE_LEVELS[level]) this.phoneLevel = level;
    this.reset();
  }

  startOnline(options) {
    this.online = options;
    this.mode = 'online';
    this.reset();
  }

  reset() {
    if (!this.mode) return;
    cancelAnimationFrame(this.animationFrame);
    this.balls = this.mode === 'school' ? trainingBalls(this.trainingScenario) : initialBalls();
    this.potAnimations = [];
    this.whitePotted = false;
    this.score = 0;
    this.phoneScore = 0;
    this.breakScore = 0;
    this.currentPlayer = this.mode === 'online' ? (this.online?.turnSeat || 'player1') : 'human';
    clearTimeout(this.phoneTimer);
    this.phoneSequenceActive = false;
    this.rulePhase = 'red';
    this.clearanceIndex = 0;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.statusMessage = 'FAUL OF GEEN POT';
    const beginnerLevel =
    this.mode === 'computer' &&
    ['novice', 'basic'].includes(
      String(this.phoneLevel).toLowerCase()
    );

    this.guideMode = this.mode === 'school'
    ? 'off'
    : beginnerLevel ? 'long' : 'normal';
      this.guideVisible =
    this.guideMode !== 'off';
    this.effectSelectorOpen = false;
    this.topSpin = 0;
    this.sideSpin = 0;
    if (this.mode === 'school') {
      const guide = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
      this.topSpin = guide.topSpin;
      this.sideSpin = guide.sideSpin;
    }
    this.phase = this.mode === 'school'
      ? 'idle'
      : this.mode === 'online' && this.online?.seat !== this.currentPlayer ? 'waiting' : 'placing';
    const activeGuide =
  TRAINING_GUIDES[
    this.trainingScenario % TRAINING_GUIDES.length
  ];

this.aimAngle =
  this.mode === 'school'
    ? activeGuide.aimAngle ?? 0
    : 0;
    this.power = 0;
    this.pointer = null;
    this.lastTime = 0;
    this.emitState(this.mode === 'school' ? 'SCHOLING' : 'PLAATS WIT IN DE D');
    this.draw();
  }

  setPhase(phase) {
    this.phase = phase;
    this.emitState();
    this.sendOnlineCue(true);
    // Een fasewissel moet onmiddellijk zichtbaar zijn. Zonder deze redraw
    // bleef de witte lijn staan tot de eerstvolgende vingerbeweging.
    this.draw();
  }

toggleGuide() {
  const modes = this.mode === 'school'
    ? ['off', 'normal', 'long', 'extra']
    : ['off', 'normal', 'long'];

  const current = this.guideVisible
    ? (this.guideMode || 'normal')
    : 'off';

  const index = modes.indexOf(current);

  this.guideMode = modes[(index + 1) % modes.length];
  this.guideVisible = this.guideMode !== 'off';

  this.draw();
  return this.guideMode;
}
  playTrainingPro() {
  if (
    this.mode !== 'school' ||
    this.phase === 'moving'
  ) return;

  // Zet dezelfde demonstratie opnieuw in de beginpositie.
  this.reset();

  const guide =
    TRAINING_GUIDES[
      this.trainingScenario %
      TRAINING_GUIDES.length
    ];

  // Eerst vergrendelen; setPhase kan waarden initialiseren.
  this.setPhase('locked');

  // Exacte PRO-instellingen.
  this.aimAngle = guide.aimAngle;
  this.power = guide.power;
  this.topSpin = guide.topSpin;
  this.sideSpin = guide.sideSpin;

  this.effectSelectorOpen = false;
  this.guideMode = 'extra';
  this.guideVisible = true;

  // Toon richting, effect, kracht en voorspelling.
  this.draw();

  // Geef de speler kort tijd om alles te bekijken.
  window.setTimeout(() => {
    if (
      this.mode === 'school' &&
      this.phase === 'locked'
    ) {
      this.shoot();
    }
  }, 1200);
}

  toggleEffectSelector() {
    if (this.phase !== 'idle') return;
    this.effectSelectorOpen = !this.effectSelectorOpen;
    this.sendOnlineCue(true);
    this.emitState();
    this.draw();
  }

  emitState(message) {
    if (message) this.statusMessage = message;
    this.onStateChange({
      phase: this.phase,
      effectSelectorOpen: this.effectSelectorOpen,
      score: this.score,
      phoneScore: this.phoneScore,
      breakScore: this.breakScore,
      currentPlayer: this.currentPlayer,
      message: this.statusMessage,
      target: this.targetText()
    });
  }

  targetText() {
    if (this.mode === 'school') {const guide = TRAINING_GUIDES[
        this.trainingScenario % TRAINING_GUIDES.length
      ];

    return guide.category;
  }
    if (this.phase === 'placing') return 'PLAATS WIT IN DE D';
    if (this.phase === 'computer') return 'PHONE SPEELT';
    if (this.phase === 'waiting') return `${this.onlinePlayerName(this.currentPlayer)} SPEELT`;
    if (this.phase === 'disconnected') return `${this.onlineOpponentName()} OFFLINE`;
    if (this.rulePhase === 'red') return 'SPEEL ROOD';
    if (this.rulePhase === 'color') return 'SPEEL KLEUR';
    if (this.rulePhase === 'clearance') return `SPEEL ${COLOR_ORDER[this.clearanceIndex].toUpperCase()}`;
    return 'FRAME KLAAR';
  }

  onlinePlayerName(seat) {
    if (seat === 'player1') return (this.online?.player1Name || 'SPELER 1').toUpperCase();
    return (this.online?.player2Name || 'SPELER 2').toUpperCase();
  }

  onlineOpponentName() {
    const opponentSeat = this.online?.seat === 'player1' ? 'player2' : 'player1';
    return this.onlinePlayerName(opponentSeat);
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => this.pointerDown(event));
    this.canvas.addEventListener('pointermove', (event) => this.pointerMove(event));
    this.canvas.addEventListener('pointerup', (event) => this.pointerUp(event));
    this.canvas.addEventListener('pointercancel', (event) => this.pointerUp(event, true));
  }

  pointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

pointerDown(event) {
  unlockGameAudio();
  if (
    !this.mode ||
    this.phase === 'moving' ||
    this.phase === 'computer' ||
    this.phase === 'waiting' ||
    this.phase === 'disconnected' ||
    this.currentPlayer === 'phone' ||
    (this.mode === 'online' &&
      this.currentPlayer !== this.online?.seat)
  ) return;

  const point = this.pointerPosition(event);
  this.canvas.setPointerCapture(event.pointerId);

  let aimMode = 'coarse';

  /*
   * Alleen tijdens het richten bepalen we of de speler
   * de richtlijn zelf heeft aangeraakt.
   */
  if (this.phase === 'idle' && !this.effectSelectorOpen) {
    const white = this.whiteScreenPosition();
    const directionX = Math.cos(this.aimAngle);
    const directionY = Math.sin(this.aimAngle);

    const relativeX = point.x - white.x;
    const relativeY = point.y - white.y;

    // Positie van de aanraking langs de richtlijn.
    const alongLine =
      relativeX * directionX +
      relativeY * directionY;

    // Afstand loodrecht tot de richtlijn.
    const distanceFromLine = Math.abs(
      relativeX * directionY -
      relativeY * directionX
    );

    const fineLineLength = Math.max(
      120,
      Math.min(this.width, this.height) * 0.42
    );

    const hitDistance =
      event.pointerType === 'mouse' ? 14 : 28;

    if (
      alongLine > 15 &&
      alongLine < fineLineLength &&
      distanceFromLine < hitDistance
    ) {
      aimMode = 'fine';
    }
  }

  this.pointer = {
    id: event.pointerId,
    start: point,
    last: point,
    moved: 0,
    aimMode
  };

  if (this.phase === 'placing') {
    this.placeWhiteAt(point);
  }
}

  pointerMove(event) {
    if (!this.pointer || this.pointer.id !== event.pointerId) return;
    const point = this.pointerPosition(event);
    const dx = point.x - this.pointer.last.x;
    const dy = point.y - this.pointer.last.y;
    this.pointer.moved += Math.hypot(dx, dy);

    if (this.phase === 'placing') {
      this.placeWhiteAt(point);
    } else if (this.phase === 'idle') {
      if (this.effectSelectorOpen) {
        const sensitivity = Math.max(90, Math.min(this.width, this.height) * .18);
        this.sideSpin = Math.max(-1, Math.min(1, this.sideSpin + dx / sensitivity));
        this.topSpin = Math.max(-1, Math.min(1, this.topSpin - dy / sensitivity));
        const length = Math.hypot(this.sideSpin, this.topSpin);
        if (length > 1) {
          this.sideSpin /= length;
          this.topSpin /= length;
        }
      } else {
const white = this.whiteScreenPosition();

const previousAngle = Math.atan2(
  this.pointer.last.y - white.y,
  this.pointer.last.x - white.x
);

const currentAngle = Math.atan2(
  point.y - white.y,
  point.x - white.x
);

const rawDifference = normalizeAngle(
  currentAngle - previousAngle
);

const fineAiming = this.pointer.aimMode === 'fine';

const aimSensitivity = fineAiming
  ? event.pointerType === 'mouse'
    ? 0.08
    : 0.12
  : 1.0;

const maximumStep = fineAiming ? 0.055 : 0.18;

const limitedDifference = Math.max(
  -maximumStep,
  Math.min(maximumStep, rawDifference)
);

// Een tik om vast te zetten mag de richting niet verschuiven.
// Pas na 3 pixels totale beweging beginnen we te richten.
if (this.pointer.moved >= 3) {
  this.aimAngle += limitedDifference * aimSensitivity;
}
      }
    } else if (this.phase === 'locked') {
      const totalX = point.x - this.pointer.start.x;
      const totalY = point.y - this.pointer.start.y;
      const backwardX = -Math.cos(this.aimAngle);
      const backwardY = -Math.sin(this.aimAngle);
      const pull = totalX * backwardX + totalY * backwardY;
      const maxPull = Math.max(110, Math.min(this.width, this.height) * .24);
      this.power = Math.max(0, Math.min(1, pull / maxPull));
    }

    this.pointer.last = point;
    this.sendOnlineCue();
    this.draw();
  }

  pointerUp(event, cancelled = false) {
    if (!this.pointer || this.pointer.id !== event.pointerId) return;
    const moved = this.pointer.moved;
    this.pointer = null;
    if (cancelled) {
      this.power = 0;
      this.draw();
      return;
    }

    if (this.phase === 'placing') {
      if (this.mode === 'online') {
        const white = this.balls.find((ball) => ball.kind === 'white');
        this.online?.onPlacement?.({ x: white.x, y: white.y });
      }
      this.power = 0;
      this.statusMessage = 'FAUL OF GEEN POT';
      this.setPhase('idle');
    } else if (this.phase === 'idle' && this.effectSelectorOpen) {
      // De gekozen pomeranspositie blijft bewaard, maar na loslaten
      // sluit de instelmodus zodat de speler meteen weer kan richten.
      this.effectSelectorOpen = false;
      this.emitState();
      // Een gewone tik zonder veegbeweging mag tegelijk de richting
      // vastzetten; zo ontstaat na EFFECT geen extra lege tik.
      if (moved < 12) this.setPhase('locked');
      else this.draw();
    } else if (this.phase === 'idle' && moved < 12) {
      this.setPhase('locked');
    } else if (this.phase === 'locked') {
      if (this.power >= .025) this.shoot();
      else if (moved < 12) {
        // Tik zonder spanning: ontgrendel en laat opnieuw richten.
        this.power = 0;
        this.setPhase('idle');
        this.draw();
      } else {
        // Eerst aangespannen en daarna volledig terug naar nul:
        // geen stoot, maar de gekozen richting blijft vaststaan.
        this.power = 0;
        this.draw();
      }
    }
  }

  shoot(remote = false) {
    console.log('SHOT', {
  angle: this.aimAngle.toFixed(6),
  power: this.power.toFixed(6),
  topSpin: this.topSpin.toFixed(6),
  sideSpin: this.sideSpin.toFixed(6)
});
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;
    // Een gebogen krachtcurve geeft meer regelruimte bij zachte en
    // middelmatige stoten. De lagere pieksnelheid voorkomt een onnatuurlijk
    // explosieve start; de lagere rolweerstand behoudt toch het volle bereik.
    const shapedPower = Math.pow(this.power, 1.35);
    const speed = 300 + shapedPower * 5300;
    const shot = { angle: this.aimAngle, power: this.power, topSpin: this.topSpin, sideSpin: this.sideSpin };
    if (this.mode === 'online' && !remote) this.online?.onShot?.(shot);
    this.remoteOnlineShot = remote;
    white.vx = Math.cos(this.aimAngle) * speed;
    white.vy = Math.sin(this.aimAngle) * speed;
    white.topSpin = this.topSpin;
    white.sideSpin = this.sideSpin;
    // Bewaar de werkelijke stootsnelheid. Bij een rechte botsing staat de
    // witte bal na de snelheidsoverdracht bijna stil; het resterende
    // topspin/backspin moet daarom uit de snelheid vlak vóór de botsing
    // worden berekend, niet uit de snelheid erna.
    white.shotSpeed = speed;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.power = 0;
    this.setPhase('moving');
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame((time) => this.tick(time));
  }

  sendOnlineCue(force = false) {
    if (this.mode !== 'online' || this.currentPlayer !== this.online?.seat ||
        (this.phase !== 'idle' && this.phase !== 'locked')) return;
    const now = performance.now();
    if (!force && now - this.lastOnlineCueAt < 45) return;
    this.lastOnlineCueAt = now;
    this.online?.onCue?.({
      angle: this.aimAngle,
      power: this.power,
      topSpin: this.topSpin,
      sideSpin: this.sideSpin,
      locked: this.phase === 'locked'
    });
  }

  placeWhiteAt(screenPoint) {
    const g = this.geometry();
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;

    // Zet de schermpositie om naar officiële tafelmillimeters en begrens
    // het middelpunt van wit tot de bruikbare binnenzijde van de D.
    const centerX = 737;
    const centerY = TABLE_WIDTH / 2;
    const usableRadius = 292 - BALL_RADIUS;
    let dx = (screenPoint.x - g.x) / g.scale - centerX;
    let dy = (screenPoint.y - g.y) / g.scale - centerY;
    dx = Math.min(0, dx);
    const distance = Math.hypot(dx, dy);
    if (distance > usableRadius) {
      const factor = usableRadius / distance;
      dx *= factor;
      dy *= factor;
    }

    const x = centerX + dx;
    const y = centerY + dy;
    const free = this.balls.every((ball) => ball === white ||
      Math.hypot(ball.x - x, ball.y - y) >= BALL_RADIUS * 2);
    if (free) {
      white.x = x;
      white.y = y;
    }
    this.draw();
  }

tick(time) {
  const frameDt = Math.min(
    .025,
    Math.max(0, (time - this.lastTime) / 1000)
  );

  this.lastTime = time;

  /*
   * De physics rekent altijd met exact dezelfde tijdstap.
   * De verversingssnelheid van het scherm heeft daardoor
   * geen invloed meer op balbanen en botsingen.
   */
  const fixedStep = 1 / 120;

  if (!Number.isFinite(this.physicsAccumulator)) {
    this.physicsAccumulator = 0;
  }

  this.physicsAccumulator += frameDt;

while (this.physicsAccumulator >= fixedStep) {
  const maximumSpeed = this.balls.reduce(
    (maximum, ball) =>
      Math.max(
        maximum,
        Math.hypot(ball.vx, ball.vy)
      ),
    0
  );

  /*
   * Een bal mag per botsingscontrole maximaal 45%
   * van zijn straal afleggen. Dit is vooral belangrijk
   * bij dunne botsingen.
   *
   * Het aantal substappen wordt uitsluitend uit de
   * huidige baltoestand berekend en blijft dus
   * reproduceerbaar.
   */
  const maximumStepDistance =
    BALL_RADIUS * .45;

  const physicsSteps = Math.max(
    1,
    Math.min(
      12,
      Math.ceil(
        maximumSpeed *
        fixedStep /
        maximumStepDistance
      )
    )
  );

  const physicsStep =
    fixedStep / physicsSteps;

  for (
    let step = 0;
    step < physicsSteps;
    step += 1
  ) {
    this.stepPhysics(physicsStep);
  }

  this.physicsAccumulator -= fixedStep;
}

  // Potanimaties hoeven niet natuurkundig deterministisch te zijn.
  for (const animation of this.potAnimations) {
    animation.age += frameDt;
  }

  this.potAnimations =
    this.potAnimations.filter(
      (animation) => animation.age < .42
    );

  this.draw();

  if (
    this.mode === 'online' &&
    !this.remoteOnlineShot &&
    time - this.lastOnlineFrameAt >= 40
  ) {
    this.lastOnlineFrameAt = time;

    this.online?.onFrame?.({
      balls: this.balls.map(
        (ball) => ({ ...ball })
      ),
      potAnimations: this.potAnimations.map(
        (animation) => ({ ...animation })
      )
    });
  }

  const ballsStopped =
    this.balls.every(
      (ball) => ball.vx === 0 && ball.vy === 0
    );

  if (
    ballsStopped &&
    this.potAnimations.length === 0
  ) {
    // Geen resterende fractie meenemen naar de volgende stoot.
    this.physicsAccumulator = 0;

    const result = this.finishShot();
    this.continueAfterShot(result);
    return;
  }

  this.animationFrame =
    requestAnimationFrame(
      (next) => this.tick(next)
    );
}

  stepPhysics(dt) {
    const restitution = .83;
    // Tijdonafhankelijke rolvertraging. Een hogere basiswaarde betekent
    // minder afremming; zo blijft het gedrag gelijk bij 60 en 120 Hz.
    const friction = Math.pow(.44, dt);
    const remainingBalls = [];
    for (const ball of this.balls) {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      const pocket = capturedPocket(ball);
      if (pocket) {
        playGameSound('pocket', .8);
        this.potAnimations.push({
          x: ball.x,
          y: ball.y,
          pocketX: pocket.x,
          pocketY: pocket.y,
          color: ball.color,
          age: 0
        });
        if (ball.kind === 'white') this.whitePotted = true;
        else this.pottedThisShot.push({ ...ball });
        continue;
      }

      if (ball.x < BALL_RADIUS) {
        if (ball.vx < -7) {
          playGameSound('cushion', Math.max(.25, Math.min(1, Math.hypot(ball.vx, ball.vy) / 1800)));
        }
        ball.x = BALL_RADIUS;
        ball.vx = Math.abs(ball.vx) * restitution;
        if (ball.kind === 'white') ball.vy -= (ball.sideSpin || 0) * Math.abs(ball.vx) * .18;
      }
      if (ball.x > TABLE_LENGTH - BALL_RADIUS) {
        if (ball.vx > 7) {
         playGameSound('cushion', Math.max(.25, Math.min(1, Math.hypot(ball.vx, ball.vy) / 1800)));
        }
        ball.x = TABLE_LENGTH - BALL_RADIUS;
        ball.vx = -Math.abs(ball.vx) * restitution;
        if (ball.kind === 'white') ball.vy += (ball.sideSpin || 0) * Math.abs(ball.vx) * .18;
      }
      if (ball.y < BALL_RADIUS) {
         if (ball.vx > 7) {
          playGameSound('cushion', Math.max(.25, Math.min(1, Math.hypot(ball.vx, ball.vy) / 1800)));
         }
        ball.y = BALL_RADIUS;
        ball.vy = Math.abs(ball.vy) * restitution;
        if (ball.kind === 'white') ball.vx += (ball.sideSpin || 0) * Math.abs(ball.vy) * .18;
      }
      if (ball.y > TABLE_WIDTH - BALL_RADIUS) {
         if (ball.vx > 7) {
          playGameSound('cushion',Math.max(.25, Math.min(1, Math.hypot(ball.vx, ball.vy) / 1800)));
         }  
        ball.y = TABLE_WIDTH - BALL_RADIUS;
        ball.vy = -Math.abs(ball.vy) * restitution;
        if (ball.kind === 'white') ball.vx -= (ball.sideSpin || 0) * Math.abs(ball.vy) * .18;
      }
      remainingBalls.push(ball);
    }
    this.balls = remainingBalls;

    // Gelijke massa's: alleen de snelheid langs de botsingslijn wordt
    // uitgewisseld. Dit is dezelfde wiskundige basis voor mens en pc.
    for (let i = 0; i < this.balls.length; i += 1) {
      for (let j = i + 1; j < this.balls.length; j += 1) {
        const a = this.balls[i];
        const b = this.balls[j];
        const firstWhiteContact = !this.firstContact && ballsOverlap(a, b) &&
          (a.kind === 'white' || b.kind === 'white');
        const white = firstWhiteContact ? (a.kind === 'white' ? a : b) : null;
        const impactVx = white?.vx || 0;
        const impactVy = white?.vy || 0;
        const impactSpeed = Math.hypot(impactVx, impactVy);
        if (firstWhiteContact) this.firstContact = a.kind === 'white' ? b.kind : a.kind;
        resolveBallCollision(a, b);
        if (firstWhiteContact) {
          // De draaiing van de witte bal blijft bij het contact aanwezig.
          // Topspin laat hem in de inkomende richting doorlopen; backspin
          // trekt hem in de tegengestelde richting terug.
          const usableImpact = Math.max(180, impactSpeed);
          const directionX = impactSpeed > 1 ? impactVx / impactSpeed : Math.cos(this.aimAngle);
          const directionY = impactSpeed > 1 ? impactVy / impactSpeed : Math.sin(this.aimAngle);
          const spinVelocity = this.topSpin * usableImpact * .62;
          white.vx += directionX * spinVelocity;
          white.vy += directionY * spinVelocity;
          white.topSpin = 0;
        }
      }
    }

    for (const ball of this.balls) {
      ball.vx *= friction;
      ball.vy *= friction;
      if (ball.kind === 'white') ball.sideSpin = (ball.sideSpin || 0) * Math.pow(.52, dt);
      if (Math.hypot(ball.vx, ball.vy) < 7) { ball.vx = 0; ball.vy = 0; }
    }
  }

  whiteScreenPosition() {
    const g = this.geometry();
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return { x: g.x, y: g.y };
    return { x: g.x + white.x * g.scale, y: g.y + white.y * g.scale };
  }

  replaceWhiteInD() {
    this.balls.push({
      x: 737 - 292 * .48,
      y: TABLE_WIDTH / 2,
      color: '#f3f3e9',
      kind: 'white',
      vx: 0,
      vy: 0
    });
    this.whitePotted = false;
  }

  switchPlayer() {
    if (this.mode === 'computer') this.currentPlayer = this.currentPlayer === 'human' ? 'phone' : 'human';
    if (this.mode === 'online') this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
  }

  addPoints(player, points) {
    if (player === 'phone' || player === 'player2') this.phoneScore += points;
    else this.score += points;
  }

  continueAfterShot(result) {
    if (this.mode === 'school') {
      this.setPhase('idle');
      return;
    }
    if (this.mode === 'online') {
      const nextPhase = this.currentPlayer === this.online?.seat
        ? (result.whitePotted ? 'placing' : 'idle')
        : 'waiting';
      this.setPhase(nextPhase);
      if (!this.remoteOnlineShot) this.online?.onSettled?.(this.onlineState());
      this.remoteOnlineShot = false;
      return;
    }
    if (this.mode !== 'computer') {
      this.setPhase(result.whitePotted ? 'placing' : 'idle');
      return;
    }
    if (this.currentPlayer === 'phone') {
      this.beginPhoneTurn();
    } else {
      if (this.phoneSequenceActive) {
        this.topSpin = this.savedHumanTopSpin || 0;
        this.sideSpin = this.savedHumanSideSpin || 0;
        this.phoneSequenceActive = false;
      }
      this.setPhase(result.whitePotted ? 'placing' : 'idle');
    }
  }

  receiveOnlinePlacement({ x, y }) {
    if (this.mode !== 'online') return;
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;
    white.x = x;
    white.y = y;
    this.setPhase(this.currentPlayer === this.online?.seat ? 'idle' : 'waiting');
  }

  receiveOnlineShot(shot) {
    if (this.mode !== 'online' || this.phase === 'moving') return;
    this.aimAngle = shot.angle;
    this.power = shot.power;
    this.topSpin = shot.topSpin;
    this.sideSpin = shot.sideSpin;
    this.remoteOnlineShot = true;
    cancelAnimationFrame(this.animationFrame);
    this.setPhase('moving');
  }

  receiveOnlineCue(cue) {
    if (this.mode !== 'online' || this.currentPlayer === this.online?.seat || this.phase === 'moving') return;
    this.aimAngle = cue.angle;
    this.power = cue.power;
    this.topSpin = cue.topSpin;
    this.sideSpin = cue.sideSpin;
    this.remoteCueLocked = Boolean(cue.locked);
    this.remoteCueReceived = true;
    this.draw();
  }

  receiveOnlineFrame(frame) {
    if (this.mode !== 'online' || !this.remoteOnlineShot || !Array.isArray(frame?.balls)) return;
    this.balls = frame.balls.map((ball) => ({ ...ball, vx: 0, vy: 0 }));
    this.potAnimations = Array.isArray(frame.potAnimations)
      ? frame.potAnimations.map((animation) => ({ ...animation })) : [];
    this.draw();
  }

  onlineState() {
    return {
      balls: this.balls.map((ball) => ({ ...ball, vx: 0, vy: 0 })),
      score: this.score,
      phoneScore: this.phoneScore,
      breakScore: this.breakScore,
      currentPlayer: this.currentPlayer,
      rulePhase: this.rulePhase,
      clearanceIndex: this.clearanceIndex,
      statusMessage: this.statusMessage,
      phase: this.phase
    };
  }

  applyOnlineState(state) {
    if (this.mode !== 'online' || !state?.balls) return;
    cancelAnimationFrame(this.animationFrame);
    this.potAnimations = [];
    this.balls = state.balls.map((ball) => ({ ...ball, vx: 0, vy: 0 }));
    this.score = state.score;
    this.phoneScore = state.phoneScore;
    this.breakScore = state.breakScore;
    this.currentPlayer = state.currentPlayer;
    this.rulePhase = state.rulePhase;
    this.clearanceIndex = state.clearanceIndex;
    this.statusMessage = state.statusMessage;
    this.whitePotted = false;
    this.remoteOnlineShot = false;
    this.remoteCueReceived = false;
    const ownPhase = state.phase === 'placing' ? 'placing' : 'idle';
    this.setPhase(this.currentPlayer === this.online?.seat ? ownPhase : 'waiting');
  }

  setOnlineDisconnected() {
    if (this.mode !== 'online') return;
    this.statusMessage = 'VERBINDING VERBROKEN';
    this.setPhase('disconnected');
  }

  resumeOnline(turnSeat) {
    if (this.mode !== 'online') return;
    this.currentPlayer = turnSeat || this.currentPlayer;
    const ownTurn = this.currentPlayer === this.online?.seat;
    this.setPhase(ownTurn ? (this.balls.some((ball) => ball.kind === 'white') ? 'idle' : 'placing') : 'waiting');
  }

  beginPhoneTurn() {
    if (!this.phoneSequenceActive) {
      this.savedHumanTopSpin = this.topSpin;
      this.savedHumanSideSpin = this.sideSpin;
      this.phoneSequenceActive = true;
    }
    this.effectSelectorOpen = false;
    this.power = 0;
    this.setPhase('computer');
    clearTimeout(this.phoneTimer);
    this.phoneTimer = setTimeout(() => {
      if (this.mode !== 'computer' || this.currentPlayer !== 'phone') return;
      const shot = this.choosePhoneShot();
      this.aimAngle = shot.angle;
      this.power = shot.power;
      this.topSpin = shot.topSpin;
      this.sideSpin = 0;
      this.draw();
      this.phoneTimer = setTimeout(() => {
        if (this.mode === 'computer' && this.currentPlayer === 'phone') this.shoot();
      }, 850);
    }, 650);
  }

  selectTrainingScenario(index) {
  if (this.mode !== 'school') return;

  const selected = Number(index);

  if (
    !Number.isInteger(selected) ||
    selected < 0 ||
    selected >= TRAINING_GUIDES.length
  ) {
    return;
  }

  this.trainingScenario = selected;
  this.reset();
}
  newTrainingScenario() {
    if (this.mode !== 'school') return;
    this.trainingScenario =
      (this.trainingScenario + 1) % TRAINING_GUIDES.length;
    this.reset();
  }

  choosePhoneShot() {
    const profile = PHONE_LEVELS[this.phoneLevel] || PHONE_LEVELS.advanced;
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return { angle: 0, power: .35, topSpin: 0 };
    const expected = this.rulePhase === 'clearance'
      ? COLOR_ORDER[this.clearanceIndex]
      : this.rulePhase;
    const legalBalls = this.balls.filter((ball) => ball !== white && (
      expected === 'color' ? ball.kind !== 'red' : ball.kind === expected
    ));
    let best = null;

    for (const ball of legalBalls) {
      for (const pocket of POCKETS) {
        const pocketDistance = Math.hypot(pocket.x - ball.x, pocket.y - ball.y);
        if (pocketDistance < 1) continue;
        const outX = (pocket.x - ball.x) / pocketDistance;
        const outY = (pocket.y - ball.y) / pocketDistance;
        const ghost = { x: ball.x - outX * BALL_RADIUS * 2, y: ball.y - outY * BALL_RADIUS * 2 };
        if (ghost.x < BALL_RADIUS || ghost.x > TABLE_LENGTH - BALL_RADIUS ||
            ghost.y < BALL_RADIUS || ghost.y > TABLE_WIDTH - BALL_RADIUS) continue;
        if (!this.pathIsClear(white, ghost, ball) || !this.pathIsClear(ball, pocket, ball)) continue;

        const cueDistance = Math.hypot(ghost.x - white.x, ghost.y - white.y);
        const inX = (ghost.x - white.x) / Math.max(1, cueDistance);
        const inY = (ghost.y - white.y) / Math.max(1, cueDistance);
        const alignment = inX * outX + inY * outY;
        if (alignment < .12) continue;
        const valueBonus = expected === 'color' ? (BALL_VALUES[ball.kind] || 0) * profile.valueWeight : 0;
        const score = cueDistance * .35 + pocketDistance + (1 - alignment) * 1700
          - valueBonus + Math.random() * profile.choiceNoise;
        if (!best || score < best.score) best = { ball, ghost, cueDistance, pocketDistance, alignment, score };
      }
    }

    if (best) {
      const baseAngle = Math.atan2(best.ghost.y - white.y, best.ghost.x - white.x);
      const error = (Math.random() - .5) * profile.angleError;
      const travel = best.cueDistance + best.pocketDistance * .72;
      const power = clamp(Math.pow(travel / 5100, .72), .2, .9);
      const topSpin = best.alignment > .82 ? -.12 : .08;
      return {
        angle: baseAngle + error,
        power: clamp(power + (Math.random() - .5) * profile.powerError, .16, .94),
        topSpin: this.phoneLevel === 'novice' ? 0 : topSpin
      };
    }

    // Geen vrije potlijn: raak een geldige bal rustig en speel verder via
    // dezelfde fysica. Dit voorkomt dat de phone een onmogelijke bal forceert.
    const fallback = legalBalls
      .filter((ball) => this.pathIsClear(white, ball, ball))
      .sort((a, b) => Math.hypot(a.x - white.x, a.y - white.y) - Math.hypot(b.x - white.x, b.y - white.y))[0]
      || legalBalls[0];
    if (!fallback) return { angle: 0, power: .28, topSpin: 0 };
    return {
      angle: Math.atan2(fallback.y - white.y, fallback.x - white.x) + (Math.random() - .5) * profile.angleError * 1.35,
      power: clamp(.3 + (Math.random() - .5) * profile.powerError, .2, .42),
      topSpin: this.phoneLevel === 'novice' ? 0 : -.08
    };
  }

  pathIsClear(from, to, target) {
    return this.balls.every((ball) => {
      if (ball === from || ball === target || ball.kind === 'white') return true;
      return pointSegmentDistance(ball, from, to) > BALL_RADIUS * 2.08;
    });
  }

  finishShot() {
  if (this.mode === 'school') {
    this.breakScore = 0;

    const guide =
      TRAINING_GUIDES[
        this.trainingScenario % TRAINING_GUIDES.length
    ];

  if (guide.target) {
    const white = this.balls.find(
      (ball) => ball.kind === 'white'
    );

    const redPotted = this.pottedThisShot.some(
      (ball) => ball.kind === 'red'
    );

    const redRequirementMet =
      guide.requiresRedPot === false ||
      redPotted;

    const whiteInTarget =
      white &&
      Math.hypot(
        white.x - guide.target.x,
        white.y - guide.target.y
      ) <= guide.target.radius;

const movedColors = this.balls.filter((ball) =>
  ball.kind !== 'white' &&
  ball.kind !== 'red' &&
  Math.hypot(
    ball.x - ball.startX,
    ball.y - ball.startY
  ) > 8
);

const requiredSecondContact =
  guide.requiredSecondContact || null;

const requiredColorMoved =
  !requiredSecondContact ||
  movedColors.some(
    (ball) =>
      ball.kind === requiredSecondContact
  );

const wrongMovedColor =
  movedColors.find(
    (ball) =>
      ball.kind !== requiredSecondContact
  );

let resultMessage;

if (this.whitePotted || !white) {
  resultMessage =
    'WIT GEPOT — SPEEL OPNIEUW';
} else if (wrongMovedColor) {
  resultMessage =
    `${wrongMovedColor.kind.toUpperCase()} GERAAKT — SPEEL OPNIEUW`;
} else if (!redRequirementMet) {
  resultMessage =
    'ROOD NIET GEPOT — SPEEL OPNIEUW';
} else if (!requiredColorMoved) {
  resultMessage =
    `${requiredSecondContact.toUpperCase()} NIET GERAAKT — SPEEL OPNIEUW`;
} else if (!whiteInTarget) {
  resultMessage =
    'POSITIE NIET GELUKT — SPEEL OPNIEUW';
} else {
  resultMessage = 'GESLAAGD';
}

    this.emitState(resultMessage);

    return {
      foul: false,
      whitePotted: this.whitePotted
    };
  }

  this.emitState('SPEEL OPNIEUW OF KIES NIEUW');

  return {
    foul: false,
    whitePotted: false
  };
}
    const shooter = this.currentPlayer;
    const whiteWasPotted = this.whitePotted;
    const expected = this.rulePhase === 'clearance'
      ? COLOR_ORDER[this.clearanceIndex]
      : this.rulePhase;
    const objectPots = this.pottedThisShot;
    const wrongFirst = !this.firstContact || (
      expected === 'color'
        ? this.firstContact === 'red'
        : this.firstContact !== expected
    );
    const nominatedColor = this.rulePhase === 'color' && this.firstContact !== 'red'
      ? this.firstContact
      : null;
    const wrongPot = objectPots.some((ball) => {
      if (expected === 'color') return ball.kind !== nominatedColor;
      return ball.kind !== expected;
    });
    const foul = this.whitePotted || wrongFirst || wrongPot;

    if (this.whitePotted) this.replaceWhiteInD();

    if (foul) {
      const highest = Math.max(4, BALL_VALUES[this.firstContact] || 0, ...objectPots.map((ball) => BALL_VALUES[ball.kind] || 0));
      this.breakScore = 0;
      const opponent = this.mode === 'online'
        ? (shooter === 'player1' ? 'player2' : 'player1')
        : (shooter === 'phone' ? 'human' : 'phone');
      if (this.mode === 'computer' || this.mode === 'online') this.addPoints(opponent, highest);
      this.respotPottedColors();
      if (this.rulePhase === 'color') {
        this.rulePhase = this.balls.some((ball) => ball.kind === 'red') ? 'red' : 'clearance';
        this.clearanceIndex = 0;
      }
      this.switchPlayer();
      this.emitState(`FOUL ${highest}`);
      return { foul: true, whitePotted: whiteWasPotted };
    }

    let points = 0;
    if (this.rulePhase === 'red') {
      points = objectPots.filter((ball) => ball.kind === 'red').length;
      this.respotPottedColors();
      if (points > 0) this.rulePhase = 'color';
    } else if (this.rulePhase === 'color') {
      points = objectPots.reduce((sum, ball) => sum + BALL_VALUES[ball.kind], 0);
      this.respotPottedColors();
      if (points > 0) {
        this.rulePhase = this.balls.some((ball) => ball.kind === 'red') ? 'red' : 'clearance';
        this.clearanceIndex = 0;
      }
    } else if (this.rulePhase === 'clearance') {
      points = objectPots.reduce((sum, ball) => sum + BALL_VALUES[ball.kind], 0);
      if (points > 0) {
        this.clearanceIndex += 1;
        if (this.clearanceIndex >= COLOR_ORDER.length) this.rulePhase = 'complete';
      }
    }

    if (points > 0) {
      this.addPoints(shooter, points);
      this.breakScore += points;
      this.emitState(`POT +${points}`);
    } else {
      this.breakScore = 0;
      if (this.rulePhase === 'color') {
        this.rulePhase = this.balls.some((ball) => ball.kind === 'red') ? 'red' : 'clearance';
        this.clearanceIndex = 0;
      }
      this.switchPlayer();
      this.emitState('GEEN POT');
    }
    return { foul: false, whitePotted: whiteWasPotted };
  }

  respotPottedColors() {
    for (const ball of this.pottedThisShot) {
      if (ball.kind === 'red') continue;
      const spot = COLOR_SPOTS[ball.kind];
      if (!spot) continue;
      const position = this.findFreeSpot(spot.x, spot.y);
      this.balls.push({ ...ball, x: position.x, y: position.y, vx: 0, vy: 0 });
    }
  }

  findFreeSpot(x, y) {
    if (this.spotIsFree(x, y)) return { x, y };
    for (const kind of [...COLOR_ORDER].reverse()) {
      const spot = COLOR_SPOTS[kind];
      if (this.spotIsFree(spot.x, spot.y)) return { ...spot };
    }
    for (let offset = BALL_RADIUS * 2; offset < 500; offset += BALL_RADIUS * 2) {
      if (this.spotIsFree(x - offset, y)) return { x: x - offset, y };
    }
    return { x, y };
  }

  spotIsFree(x, y) {
    return this.balls.every((ball) => Math.hypot(ball.x - x, ball.y - y) >= BALL_RADIUS * 2);
  }

  geometry() {
    const margin = Math.max(14, Math.min(this.width, this.height) * .025);
    const rail = Math.max(18, Math.min(this.width, this.height) * .045);
    const availableWidth = this.width - 2 * (margin + rail);
    const availableHeight = this.height - 2 * (margin + rail);
    const ratio = TABLE_LENGTH / TABLE_WIDTH;
    let width = availableWidth;
    let height = width / ratio;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * ratio;
    }
    return { x: (this.width - width) / 2, y: (this.height - height) / 2, width, height, rail, scale: width / TABLE_LENGTH };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#17120e';
    ctx.fillRect(0, 0, this.width, this.height);
    const g = this.geometry();

    roundedRect(ctx, g.x - g.rail, g.y - g.rail, g.width + 2 * g.rail, g.height + 2 * g.rail, g.rail * .55, '#6d3b1f');
    ctx.strokeStyle = '#a35f31';
    ctx.lineWidth = Math.max(2, g.rail * .12);
    roundedRect(ctx, g.x - g.rail * .78, g.y - g.rail * .78, g.width + 1.56 * g.rail, g.height + 1.56 * g.rail, g.rail * .45, null, true);
    ctx.fillStyle = '#176b3a';
    ctx.fillRect(g.x, g.y, g.width, g.height);

    const cushion = Math.max(5, g.rail * .3);
    ctx.fillStyle = '#0a4929';
    ctx.fillRect(g.x, g.y - cushion, g.width, cushion);
    ctx.fillRect(g.x, g.y + g.height, g.width, cushion);
    ctx.fillRect(g.x - cushion, g.y, cushion, g.height);
    ctx.fillRect(g.x + g.width, g.y, cushion, g.height);

    const pockets = [[0,0],[.5,0],[1,0],[0,1],[.5,1],[1,1]];
    for (const [px, py] of pockets) {
      ctx.beginPath();
      ctx.arc(g.x + px * g.width, g.y + py * g.height, Math.max(7, 45 * g.scale), 0, Math.PI * 2);
      ctx.fillStyle = '#030303';
      ctx.fill();
      ctx.strokeStyle = '#1b1b1b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const baulkX = g.x + 737 * g.scale;
    const centerY = g.y + g.height / 2;
    const dRadius = 292 * g.scale;
    ctx.strokeStyle = 'rgba(220,238,221,.7)';
    ctx.lineWidth = Math.max(1, 2 * g.scale);
    ctx.beginPath();
    ctx.moveTo(baulkX, g.y);
    ctx.lineTo(baulkX, g.y + g.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(baulkX, centerY, dRadius, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();

    if (this.mode) this.drawScore(g);
    if (this.mode && this.phase !== 'placing') this.drawEffectSelector(g);
    if (this.mode === 'school' && this.phase !== 'moving') this.drawTrainingPower(g);
    if (this.mode === 'school') {this.drawTrainingTarget(g);}
    if (this.mode === 'school' && this.phase === 'idle') this.drawTrainingInstructions(g);
    for (const ball of this.balls) drawBall(ctx, g, ball);
    for (const animation of this.potAnimations) drawPotAnimation(ctx, g, animation);
    if (this.mode && (this.phase === 'idle' || this.phase === 'locked' || this.phase === 'computer' ||
        (this.phase === 'waiting' && this.mode === 'online' && this.remoteCueReceived))) this.drawCue(g);
  }

  drawCue(g) {
    const ctx = this.ctx;
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;
    const center = { x: g.x + white.x * g.scale, y: g.y + white.y * g.scale };
    const dx = Math.cos(this.aimAngle);
    const dy = Math.sin(this.aimAngle);
    const radius = Math.max(3.5, BALL_RADIUS * g.scale);
    const pull = this.power * Math.max(70, Math.min(this.width, this.height) * .16);
    const cueLocked = this.phase === 'locked' || this.phase === 'computer' ||
      (this.phase === 'waiting' && this.remoteCueLocked);

    // Fijne puntlijn vóór wit; rood zodra de richting vaststaat.
    if (this.guideVisible) {
      const startDistance = radius + 4;
      const guideDistance = rayDistanceToTableEdge(white.x, white.y, dx, dy) * g.scale;
      const startX = center.x + dx * startDistance;
      const startY = center.y + dy * startDistance;
      const endX = center.x + dx * Math.max(startDistance + 40, guideDistance - radius);
      const endY = center.y + dy * Math.max(startDistance + 40, guideDistance - radius);
      const guideGradient = ctx.createLinearGradient(
        startX,
        startY,
        endX,
        endY
      );

const longGuide =
  this.guideMode === 'long' ||
  this.guideMode === 'extra';

const stops = longGuide
  ? [0, .45, .70, .88, 1]
  : [0, .18, .38, .58, .72];

const colors = cueLocked
  ? [
      'rgba(255,112,100,1)',
      'rgba(255,102,92,.72)',
      'rgba(255,92,82,.28)',
      'rgba(255,82,72,.06)',
      'rgba(255,82,72,0)'
    ]
  : [
      'rgba(245,250,244,.82)',
      'rgba(245,250,244,.60)',
      'rgba(245,250,244,.24)',
      'rgba(245,250,244,.05)',
      'rgba(245,250,244,0)'
    ];

stops.forEach((position, index) => {
  guideGradient.addColorStop(position, colors[index]);
});

if (!longGuide) {
  guideGradient.addColorStop(1, colors[4]);
}
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = guideGradient;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    }

    if (this.mode === 'school' && this.guideMode === 'extra') {
      this.drawTrainingPrediction(g, white, dx, dy);
    }

    const tipDistance = radius + 5 + pull;
    const cueLength = Math.max(150, Math.min(this.width, this.height) * .34);
    const tip = { x: center.x - dx * tipDistance, y: center.y - dy * tipDistance };
    const middle = { x: tip.x - dx * cueLength * .62, y: tip.y - dy * cueLength * .62 };
    const back = { x: tip.x - dx * cueLength, y: tip.y - dy * cueLength };
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,.48)';
    ctx.lineWidth = 9;
    line(ctx, back.x + 3, back.y + 3, tip.x + 3, tip.y + 3);
    ctx.strokeStyle = '#c9954e';
    ctx.lineWidth = 6;
    line(ctx, middle.x, middle.y, tip.x, tip.y);
    ctx.strokeStyle = '#49301d';
    ctx.lineWidth = 7;
    line(ctx, back.x, back.y, middle.x, middle.y);
    ctx.strokeStyle = '#e8ddc7';
    ctx.lineWidth = 5;
    line(ctx, tip.x - dx * 8, tip.y - dy * 8, tip.x, tip.y);
  }



  drawScore(g) {
    const ctx = this.ctx;
    const centerX = g.x + g.width / 2;
    const firstY = g.y + g.height * .075;
    const small = Math.max(13, Math.min(20, g.height * .026));
    const large = Math.max(17, Math.min(28, g.height * .038));
    ctx.save();
    ctx.fillStyle = 'rgba(137, 203, 153, .78)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (this.mode === 'school') {
      ctx.font = `750 ${large}px system-ui, sans-serif`;
     const guide =
      TRAINING_GUIDES[
    this.trainingScenario % TRAINING_GUIDES.length
  ];

ctx.fillText(guide.category, centerX, firstY);
      ctx.restore();
      return;
    }
    ctx.font = `600 ${small}px system-ui, sans-serif`;
    const scoreText = this.mode === 'computer'
      ? `${this.statusMessage}   JIJ ${this.score}   PHONE ${this.phoneScore}   ${PHONE_LEVELS[this.phoneLevel].label}   BREAK ${this.breakScore}`
      : this.mode === 'online'
        ? `${this.statusMessage}   ${(this.online?.player1Name || 'SPELER 1').toUpperCase()} ${this.score}   ${(this.online?.player2Name || 'SPELER 2').toUpperCase()} ${this.phoneScore}   BREAK ${this.breakScore}`
        : `${this.statusMessage}   SCORE ${this.score}   BREAK ${this.breakScore}`;
    ctx.fillText(
      scoreText,
      centerX,
      firstY
    );
    ctx.font = `750 ${large}px system-ui, sans-serif`;
    ctx.fillText(this.targetText(), centerX, firstY + large * 1.25);
    ctx.restore();
  }

drawTrainingTarget(g) {
  if (this.mode !== 'school') return;

  const guide =
    TRAINING_GUIDES[
      this.trainingScenario % TRAINING_GUIDES.length
    ];

  if (!guide.target) return;

  const ctx = this.ctx;

  const x = g.x + guide.target.x * g.scale;
  const y = g.y + guide.target.y * g.scale;
  const radius = guide.target.radius * g.scale;

  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  ctx.fillStyle = 'rgba(145, 205, 160, 0.08)';
  ctx.fill();

  ctx.strokeStyle = 'rgba(174, 231, 184, 0.70)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 7]);
  ctx.stroke();

  ctx.restore();
}

drawTrainingInstructions(g) {
  const ctx = this.ctx;

  const guide =
    TRAINING_GUIDES[
      this.trainingScenario % TRAINING_GUIDES.length
    ];

  const fontSize = Math.max(
    11,
    Math.min(16, g.height * .022)
  );

  const lineHeight = fontSize * 1.35;

  /*
   * Eerste twee regels onder de effectcirkel.
   */
  const ringRadius = Math.max(
    34,
    Math.min(58, g.height * .105)
  );

  const circleCenterX = g.x + g.width * .12;
  const circleCenterY = g.y + g.height * .16;

  const leftWidth = g.width * .24;
  const leftY =
  circleCenterY +
  ringRadius +
  Math.max(48, g.height * .085);

  const leftLines = [
    'B = TOPSPIN   O = BACKSPIN   L/R = ZIJEFFECT',
    'Tik EFFECT en verschuif de zwarte stip.'
  ];

  ctx.save();

  ctx.fillStyle = 'rgba(151, 211, 166, .82)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;

  let lineY = leftY;

  for (const textLine of leftLines) {
    const wrapped = wrapCanvasText(
      ctx,
      textLine,
      leftWidth
    );

    for (const part of wrapped) {
      ctx.fillText(part, circleCenterX, lineY);
      lineY += lineHeight;
    }

    lineY += lineHeight * .25;
  }

  /*
   * Overige instructies rechts op het laken.
   */
  const rightX = g.x + g.width * .54;
  const rightY = g.y + g.height * .14;
  const rightWidth = g.width * .42;

  const rightLines = [
    `${guide.demo} · ${guide.category} · ${guide.name}`,
    `KRACHT: ${guide.powerName}`,
    `HOE?: ${guide.instruction}`,
    `DOEL: ${guide.result}`
  ];

  ctx.textAlign = 'left';

  lineY = rightY;

  for (const textLine of rightLines) {
    const wrapped = wrapCanvasText(
      ctx,
      textLine,
      rightWidth
    );

    for (const part of wrapped) {
      ctx.fillText(part, rightX, lineY);
      lineY += lineHeight;
    }

    lineY += lineHeight * .15;
  }

  ctx.restore();
}
  drawTrainingPower(g) {
    const ctx = this.ctx;
    const guide = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
    const ringRadius = Math.max(34, Math.min(58, g.height * .105));
    const centerX = g.x + g.width * .12;
    const y =
      g.y +
      g.height * .16 +
      ringRadius +
      Math.max(24, g.height * .025);
        const halfWidth = ringRadius * .72;
    const startX = centerX - halfWidth;
    const endX = centerX + halfWidth;
    const proX = startX + (endX - startX) * guide.power;
    const actualX = startX + (endX - startX) * this.power;

    ctx.save();
    ctx.strokeStyle = 'rgba(7, 18, 10, .62)';
    ctx.lineWidth = 1;
    line(ctx, startX, y, endX, y);
    ctx.fillStyle = 'rgba(151, 211, 166, .82)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `600 ${Math.max(9, Math.min(12, g.height * .017))}px system-ui, sans-serif`;
    ctx.fillText('KRACHT', centerX, y - 5);
    ctx.strokeStyle = 'rgba(174, 231, 184, .95)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(proX, y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(actualX, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEffectSelector(g) {
    const ctx = this.ctx;
    const radius = Math.max(34, Math.min(58, g.height * .105));
    const center = {
      x: g.x + g.width * .12,
      y: g.y + g.height * .16
    };
    const usable = radius * .72;
    ctx.save();
    // Bleekgroen betekent: de stip is vastgenomen en volgt de vinger.
    // Zwart betekent: de gekozen pomeranspositie is losgelaten en bewaard.
    ctx.strokeStyle = this.effectSelectorOpen
      ? 'rgba(173, 232, 185, .96)'
      : 'rgba(5, 12, 8, .88)';
    ctx.lineWidth = this.effectSelectorOpen ? 2 : 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(5, 12, 8, .34)';
    ctx.lineWidth = 1;
    line(ctx, center.x - usable, center.y, center.x + usable, center.y);
    line(ctx, center.x, center.y - usable, center.x, center.y + usable);
    if (this.effectSelectorOpen) {
      ctx.fillStyle = 'rgba(235, 255, 238, .88)';
      ctx.beginPath();
      ctx.arc(
        center.x + this.sideSpin * usable,
        center.y - this.topSpin * usable,
        Math.max(9, radius * .16),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    if (this.mode === 'school') {
      const pro = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
      ctx.strokeStyle = 'rgba(174, 231, 184, .9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center.x + pro.sideSpin * usable, center.y - pro.topSpin * usable, Math.max(8, radius * .15), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(center.x + this.sideSpin * usable, center.y - this.topSpin * usable, Math.max(5, radius * .105), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
   drawTrainingPrediction(g, white, directionX, directionY) {
    const ctx = this.ctx;
    const guide =
      TRAINING_GUIDES[
        this.trainingScenario % TRAINING_GUIDES.length
      ];

    const previewPower =
      this.phase === 'locked'
        ? this.power
        : guide.power;

    if (previewPower < .025) return;

    const initialSpeed =
      300 + Math.pow(previewPower, 1.35) * 5300;

    const approach = predictedCueApproach(
      white,
      directionX * initialSpeed,
      directionY * initialSpeed,
      this.balls,
      this.sideSpin
    );

    ctx.save();
    ctx.setLineDash([2, 7]);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(235, 249, 237, .82)';

    if (
      guide.category === 'ONTSNAPPEN' ||
      guide.category === 'LANGE STOOT'
    ) {
      drawTablePath(ctx, g, approach.points);
    }

    if (!approach.hit) {
      ctx.restore();
      return;
    }

    const hit = approach.hit;
    const contactX = hit.contactX;
    const contactY = hit.contactY;
    const impactSpeed = hit.impactSpeed;

    if (impactSpeed < 7) {
      ctx.restore();
      return;
    }

    const normalX =
      (hit.ball.x - contactX) / (BALL_RADIUS * 2);

    const normalY =
      (hit.ball.y - contactY) / (BALL_RADIUS * 2);

    const incomingNormal =
      impactSpeed *
      Math.max(
        0,
        hit.directionX * normalX +
        hit.directionY * normalY
      );

    const impulse =
      incomingNormal * (1 + .94) * .5;

    const objectVx = normalX * impulse;
    const objectVy = normalY * impulse;

    const whiteVx =
      hit.directionX * impactSpeed -
      normalX * impulse +
      hit.directionX *
        this.topSpin *
        impactSpeed *
        .62;

    const whiteVy =
      hit.directionY * impactSpeed -
      normalY * impulse +
      hit.directionY *
        this.topSpin *
        impactSpeed *
        .62;

    const objectPath = predictedBallPath(
      hit.ball.x,
      hit.ball.y,
      objectVx,
      objectVy
    );

    const whitePath = predictedBallPath(
      contactX,
      contactY,
      whiteVx,
      whiteVy,
      hit.sideSpin
    );

    if (objectPath.length > 1) {
      ctx.strokeStyle = 'rgba(255, 165, 158, .80)';
      drawTablePath(ctx, g, objectPath);
    }

    if (whitePath.length > 1) {
      ctx.strokeStyle = 'rgba(235, 249, 237, .82)';
      drawTablePath(ctx, g, whitePath);
    }

    ctx.restore();
  }

}

function initialBalls() {
  const centerY = TABLE_WIDTH / 2;

  const balls = [
    {
      x: 737,
      y: centerY + 292,
      color: '#ffd600',
      kind: 'yellow'
    },
    {
      x: 737,
      y: centerY - 292,
      color: '#159447',
      kind: 'green'
    },
    {
      x: 737,
      y: centerY,
      color: '#7b3f1d',
      kind: 'brown'
    },
    {
      x: TABLE_LENGTH * .5,
      y: centerY,
      color: '#1769d2',
      kind: 'blue'
    },
    {
      x: TABLE_LENGTH * .75,
      y: centerY,
      color: '#ff7ca8',
      kind: 'pink'
    },
    {
      x: TABLE_LENGTH - 324,
      y: centerY,
      color: '#111',
      kind: 'black'
    },
    {
      x: 737 - 292 * .48,
      y: centerY,
      color: '#f3f3e9',
      kind: 'white',
      vx: 0,
      vy: 0
    }
  ];

  const diameter = BALL_RADIUS * 2;
  const apex =
    TABLE_LENGTH * .75 +
    diameter * 1.03;

  const dx =
    diameter *
    Math.sqrt(3) /
    2 *
    1.01;

  for (let column = 0; column < 5; column += 1) {
    for (
      let row = 0;
      row <= column;
      row += 1
    ) {
      balls.push({
        x: apex + column * dx,
        y:
          centerY +
          (row - column / 2) *
          diameter *
          1.01,
        color: '#c71925',
        kind: 'red'
      });
    }
  }

  return balls.map((ball) => ({
    vx: 0,
    vy: 0,
    ...ball
  }));
}


function trainingBalls(index = 0) {
  const centerY = TABLE_WIDTH / 2;
const layouts = [
  {
    white: { x: 980, y: centerY },
    red: { x: 1900, y: centerY }
  },
 {
    white: { x: 980, y: centerY },
    red: { x: 1900, y: centerY }
  },
  {
    white: { x: 980, y: centerY },
    red: { x: 1900, y: centerY }
  },
  {
    white: {
      x: TABLE_LENGTH / 2,
      y: 1400
    },
    red: {
      x: TABLE_LENGTH / 2,
      y: 600
    }
      },  
    {
      white: {
        x: 2850,
        y: 1250
      },
      red: {
        x: 2100,
        y: 620
      }
    },
    {
      white: {
        x: 2080,
        y: 1515
      },
      red: {
        x: 2100,
        y: 620
      }
    },

    {
      white: {
        x: 1792,
        y: 1449
      },
      red: {
        x: 2100,
        y: 620
      }
    },

    {
      white: {
        x: 2665,
        y: 1386
      },
      red: {
        x: 2100,
        y: 620
      }
    },
    {
      white: {
        x: 1000,
        y: centerY
      },
      red: {
        x: 1800,
        y: centerY
      }
    },
    {
        white: {
          x: 1000,
          y: centerY
        },
        red: {
          x: 1800,
          y: centerY
        }
      },
      {
        white: {
          x: 1000,
          y: centerY
        },
        red: {
          x: 1800,
          y: centerY
        }
      },
      {
        white: {
          x: 2200,
          y: 1450
        },
        red: {
          x: 2000,
          y: 600
        },
        extraBalls: [
          {
            x: TABLE_LENGTH / 2,
            y: centerY,
            color: '#1769d2',
            kind: 'blue'
          }
        ]
      },
      {
      white: {
        x: 2445,
        y: 340
      },
      red: {
        x: 3000,
        y: 1050
      },
      extraBalls: [
        {
          x: TABLE_LENGTH - 324,
          y: centerY,
          color: '#111111',
          kind: 'black'
        }
      ]
    },
    {
      white: {
        x: 2157,
        y: 1178
      },
      red: {
        x: 2850,
        y: 600
      },
      extraBalls: [
        {
          x: TABLE_LENGTH * .75,
          y: centerY,
          color: '#ff7ca8',
          kind: 'pink'
        }
      ]
    },
    {
      white: {
        x: TABLE_LENGTH / 2,
        y: 1300
      },
      red: {
        x: TABLE_LENGTH / 2,
        y: 500
      },
      extraBalls: [
        {
          x: 2100,
          y: 350,
          color: '#c71925',
          kind: 'red'
        }
      ]
    },
    {
      white: {
        x: TABLE_LENGTH / 2,
        y: 1300
      },
      red: {
        x: TABLE_LENGTH / 2,
        y: 500
      },
      extraBalls: [
        {
          x: 2100,
          y: 1000,
          color: '#c71925',
          kind: 'red'
        }
      ]
    },
    {
      white: {
        x: 3200,
        y: 400
      },
      red: {
        x: 2100,
        y: 1400
      }
    },
    {
      white: {
        x: 2288,
        y: 473
      },
      red: {
        x: 2100,
        y: 1400
      }
    },
    {
      white: {
        x: 2288,
        y: 473
      },
      red: {
        x: 2100,
        y: 1400
      }
    },
    {
      white: {
        x: 2288,
        y: 473
      },
      red: {
        x: 2100,
        y: 1400
      }
    },
    {
      white: {
        x: 2288,
        y: 473
      },
      red: {
        x: 2100,
        y: 1400
      }
    },
    {
      white: {
        x: 1900,
        y: 1100
      },
      red: {
        x: 2700,
        y: 800
      }
    },
    {
      white: {
        x: 2700,
        y: 1320
      },
      red: {
        x: 1900,
        y: 1050
      },
      extraBalls: [
        {
          x: 737,
          y: centerY + 292,
          color: '#ffd600',
          kind: 'yellow'
        }
      ]
      },
      {
      white: {
        x: 520,
        y: centerY + 292
      },
      red: {
        x: 1900,
        y: centerY + 292
      },
      extraBalls: [
        {
          x: 737,
          y: centerY + 292,
          color: '#ffd600',
          kind: 'yellow'
        }
      ]
    },
    {
      white: {
        x: 520,
        y: centerY + 292
      },
      red: {
        x: 1900,
        y: centerY + 292
      },
      extraBalls: [
        {
          x: 737,
          y: centerY + 292,
          color: '#ffd600',
          kind: 'yellow'
        }
      ]
    },
    {
      white: {
        x: 2600,
        y: 1200
      },
      red: {
        x: 1900,
        y: 1200
      },
      extraBalls: [
        {
          x: 737,
          y: centerY + 292,
          color: '#ffd600',
          kind: 'yellow'
        },
        {
          x: 737,
          y: centerY - 292,
          color: '#159447',
          kind: 'green'
        },
        {
          x: 737,
          y: centerY,
          color: '#7b3f1d',
          kind: 'brown'
        }
      ]
    },
    {
      white: {
        x: 2700,
        y: 650
      },
      red: {
        x: 2100,
        y: 950
      }
    },
    {
      white: {
        x: 2670,
        y: 325
      },
      red: {
        x: 1962,
        y: 888
      },
      extraBalls: [
        {
          x: 737,
          y: centerY + 292,
          color: '#ffd600',
          kind: 'yellow'
        }
      ]
    },
    {
  white: {
    x: 1200,
    y: centerY
  },
  red: {
    x: 2000,
    y: centerY
  },
  extraBalls: [
    {
      x: 2046,
      y: centerY - 26.25,
      color: '#c71925',
      kind: 'red'
    },
    {
      x: 2046,
      y: centerY + 26.25,
      color: '#c71925',
      kind: 'red'
    },
    {
      x: 2091,
      y: centerY - 52.5,
      color: '#c71925',
      kind: 'red'
    },
    {
      x: 2091,
      y: centerY,
      color: '#c71925',
      kind: 'red'
    },
    {
      x: 2091,
      y: centerY + 52.5,
      color: '#c71925',
      kind: 'red'
    }
  ]
},
{
  white: {
    x: 1785,
    y: 1100
  },
  red: {
    x: 2100,
    y: 1400
  },
  extraBalls: [
    {
      x: 1785,
      y: 500,
      color: '#1769d2',
      kind: 'blue'
    }
  ]
},
{
  white: {
    x: 2600,
    y: 900
  },
  red: {
    x: 1785,
    y: 300
  },
  extraBalls: [
    {
      x: 800,
      y: 350,
      color: '#1769d2',
      kind: 'blue'
    }
  ]
},
{
  white: {
    x: 600,
    y: 1565
  },
  red: {
    x: 3000,
    y: 299.93
  },
  extraBalls: [
    {
      x: 2730,
      y: 600,
      color: '#1769d2',
      kind: 'blue'
    }
  ]
},
{
  white: {
    x: 2600,
    y: 900
  },
  red: {
    x: 1787,
    y: 300
  },
  extraBalls: [
    {
      x: 1200,
      y: 355,
      color: '#1769d2',
      kind: 'blue'
    }
  ]
}

];
 const layout = layouts[index % layouts.length];
 const balls = [
  {
    ...layout.white,
    color: '#f3f3e9',
    kind: 'white'
  },
  {
    ...layout.red,
    color: '#c71925',
    kind: 'red'
  },
  ...(layout.extraBalls || [])
];

return balls.map((ball) => ({
  vx: 0,
  vy: 0,
  startX: ball.x,
  startY: ball.y,
  ...ball
}));
}

function drawBall(ctx, g, ball) {
  const x = g.x + ball.x * g.scale;
  const y = g.y + ball.y * g.scale;
  const radius = Math.max(3.5, BALL_RADIUS * g.scale);
  ctx.beginPath();
  ctx.arc(x + radius * .16, y + radius * .2, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.38)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - radius * .32, y - radius * .32, radius * .23, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,.58)';
  ctx.fill();
}

function drawPotAnimation(ctx, g, animation) {
  const progress = Math.min(1, animation.age / .42);
  const eased = 1 - Math.pow(1 - progress, 2);
  const x = g.x + (animation.x + (animation.pocketX - animation.x) * eased) * g.scale;
  const y = g.y + (animation.y + (animation.pocketY - animation.y) * eased) * g.scale;
  const radius = Math.max(1, BALL_RADIUS * g.scale * (1 - eased * .72));
  ctx.save();
  ctx.globalAlpha = 1 - progress;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = animation.color;
  ctx.fill();
  ctx.restore();
}

function capturedPocket(ball) {
  const captureRadius = 58;
  const pockets = [
    { x: 0, y: 0 },
    { x: TABLE_LENGTH / 2, y: 0 },
    { x: TABLE_LENGTH, y: 0 },
    { x: 0, y: TABLE_WIDTH },
    { x: TABLE_LENGTH / 2, y: TABLE_WIDTH },
    { x: TABLE_LENGTH, y: TABLE_WIDTH }
  ];
  return pockets.find((pocket) => Math.hypot(ball.x - pocket.x, ball.y - pocket.y) < captureRadius);
}

function predictedPocketHit(
  x,
  y,
  directionX,
  directionY,
  maximumDistance
) {
  const captureRadius = 58;
  let nearest = null;

  for (const pocket of POCKETS) {
    const offsetX = pocket.x - x;
    const offsetY = pocket.y - y;

    const projection =
      offsetX * directionX +
      offsetY * directionY;

    if (projection < 0) continue;

    const perpendicularSquared =
      offsetX * offsetX +
      offsetY * offsetY -
      projection * projection;

    if (
      perpendicularSquared >
      captureRadius * captureRadius
    ) {
      continue;
    }

    const entryDistance =
      projection -
      Math.sqrt(
        Math.max(
          0,
          captureRadius * captureRadius -
          perpendicularSquared
        )
      );

    if (
      entryDistance >= 0 &&
      entryDistance <= maximumDistance &&
      (!nearest || entryDistance < nearest.distance)
    ) {
      nearest = {
        distance: entryDistance,
        pocket
      };
    }
  }

  return nearest;
}

function roundedRect(ctx, x, y, width, height, radius, fill, stroke = false) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function normalizeAngle(angle) {
  if (angle > Math.PI) return angle - Math.PI * 2;
  if (angle < -Math.PI) return angle + Math.PI * 2;
  return angle;
}

function rayDistanceToTableEdge(x, y, dx, dy) {
  const distances = [];
  if (dx > 0) distances.push((TABLE_LENGTH - x) / dx);
  if (dx < 0) distances.push((0 - x) / dx);
  if (dy > 0) distances.push((TABLE_WIDTH - y) / dy);
  if (dy < 0) distances.push((0 - y) / dy);
  return Math.min(...distances.filter((distance) => distance > 0));
}

function resolveBallCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minimum = BALL_RADIUS * 2;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared <= 0 || distanceSquared >= minimum * minimum) return;
  const distance = Math.sqrt(distanceSquared);
  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minimum - distance;
  a.x -= nx * overlap * .5;
  a.y -= ny * overlap * .5;
  b.x += nx * overlap * .5;
  b.y += ny * overlap * .5;
  const relativeNormal = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (relativeNormal <= 0) return;
  const collisionVolume = Math.max(
  .08,
  Math.min(1, relativeNormal / 1800)
);

playGameSound('ball', collisionVolume);
  const collisionRestitution = .94;
  const impulse = relativeNormal * (1 + collisionRestitution) * .5;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;
}

function ballsOverlap(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y) < BALL_RADIUS * 2;
}

function firstRayBallHit(white, dx, dy, balls) {
  let nearest = null;
  for (const ball of balls) {
    if (ball === white) continue;
    const offsetX = ball.x - white.x;
    const offsetY = ball.y - white.y;
    const projection = offsetX * dx + offsetY * dy;
    if (projection <= 0) continue;
    const perpendicularSquared = offsetX * offsetX + offsetY * offsetY - projection * projection;
    const radius = BALL_RADIUS * 2;
    if (perpendicularSquared > radius * radius) continue;
    const distance = projection - Math.sqrt(Math.max(0, radius * radius - perpendicularSquared));
    if (distance > 0 && (!nearest || distance < nearest.distance)) nearest = { ball, distance };
  }
  return nearest;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function pointSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t));
}

function wrapCanvasText(ctx, text, maximumWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maximumWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

