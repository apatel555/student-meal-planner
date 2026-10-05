/* Student Meal Planner
   No build step, no backend. Everything is saved in your browser (localStorage).
   Prices are rough estimates: edit the numbers in INGREDIENTS and STORES below to tune them. */
(function () {
  'use strict';

  /* ======================================================================
     DATA
     ====================================================================== */

  var KEY = 'studentMealPlanner.v1';

  // m = price multiplier against our base (Tesco) prices.
  // Which? (Aug 2026, 92-item basket, no loyalty cards) had Aldi about 17% under Tesco and Asda about 4% under.
  // Its eight-item own-label essentials basket was only about 3% apart. Real students buy a mix,
  // so these sit in between. Tune them if your own shop says otherwise.
  var STORES = {
    aldi:       { name: 'Aldi',        m: 0.92 },
    lidl:       { name: 'Lidl',        m: 0.93 },
    asda:       { name: 'Asda',        m: 0.97 },
    tesco:      { name: 'Tesco',       m: 1.00 },
    sainsburys: { name: "Sainsbury's", m: 1.01 }
  };

  var AISLES = [
    ['veg', 'Fruit & veg'],
    ['meat', 'Meat & fish'],
    ['chilled', 'Chilled'],
    ['bread', 'Bread & wraps'],
    ['cupboard', 'Cupboard & tins'],
    ['frozen', 'Frozen'],
    ['sauce', 'Oils, spices & sauces']
  ];

  // n name, u unit (g / ml / each), p pack size, c base pack price in pence (Tesco own-brand/value range),
  // l pack label, a aisle, f flags: m meat, pk pork, fi fish, d dairy, e egg, g gluten, n nuts.
  // Last checked October 2026. Prices marked "anchored" were set from published 2026 figures
  // (Aldi price announcements, Which?, supermarket price trackers). The rest are my best estimates.
  var ING = {
    potato:    { n: 'Potatoes',            u: 'g',    p: 2000, c: 145, l: '2 kg bag',      a: 'veg' },      // anchored: Aldi 2 kg 1.32
    sweetpot:  { n: 'Sweet potatoes',      u: 'g',    p: 1000, c: 110, l: '1 kg bag',      a: 'veg' },      // anchored: Aldi 6 for 1.19
    carrot:    { n: 'Carrots',             u: 'g',    p: 1000, c: 75,  l: '1 kg bag',      a: 'veg' },      // anchored: Aldi 1 kg 69p
    onion:     { n: 'Onions',              u: 'each', p: 8,    c: 108, l: 'bag of 8 (1 kg)', a: 'veg' },    // anchored: Aldi 1 kg 99p
    garlic:    { n: 'Garlic',              u: 'each', p: 10,   c: 42,  l: 'bulb (10 cloves)', a: 'veg' },   // anchored: Aldi bulb 39p
    pepper:    { n: 'Peppers',             u: 'each', p: 3,    c: 150, l: 'pack of 3',     a: 'veg' },
    mushroom:  { n: 'Mushrooms',           u: 'g',    p: 300,  c: 100, l: '300 g punnet',  a: 'veg' },
    tomatoes:  { n: 'Tomatoes',            u: 'each', p: 6,    c: 120, l: 'pack of 6',     a: 'veg' },
    cucumber:  { n: 'Cucumber',            u: 'each', p: 1,    c: 65,  l: '1 cucumber',    a: 'veg' },
    cabbage:   { n: 'Cabbage',             u: 'g',    p: 800,  c: 80,  l: '1 white cabbage', a: 'veg' },
    broccoli:  { n: 'Broccoli',            u: 'g',    p: 350,  c: 90,  l: '350 g head',    a: 'veg' },

    chicken:   { n: 'Chicken breast',      u: 'g',    p: 650,  c: 470, l: '650 g pack',    a: 'meat', f: ['m'] },       // Aldi 300 g 2.29 (Sep 2026)
    mince:     { n: 'Beef mince',          u: 'g',    p: 500,  c: 325, l: '500 g pack',    a: 'meat', f: ['m'] },       // anchored: Tesco 3.25, others 3.09 (Sep 2026)
    sausages:  { n: 'Pork sausages',       u: 'each', p: 8,    c: 175, l: 'pack of 8',     a: 'meat', f: ['m', 'pk'] },

    eggs:      { n: 'Eggs',                u: 'each', p: 6,    c: 195, l: 'box of 6',      a: 'chilled', f: ['e'] },    // anchored: Aldi 6 for 1.79
    milk:      { n: 'Milk',                u: 'ml',   p: 1136, c: 125, l: '2 pint bottle', a: 'chilled', f: ['d'] },    // anchored: Aldi 2 pints 1.20 (Sep 2026)
    cheddar:   { n: 'Cheddar',             u: 'g',    p: 350,  c: 315, l: '350 g block',   a: 'chilled', f: ['d'] },
    yoghurt:   { n: 'Natural yoghurt',     u: 'g',    p: 500,  c: 90,  l: '500 g tub',     a: 'chilled', f: ['d'] },
    feta:      { n: 'Feta',                u: 'g',    p: 200,  c: 185, l: '200 g block',   a: 'chilled', f: ['d'] },    // anchored: Aldi 200 g 1.69
    tofu:      { n: 'Tofu',                u: 'g',    p: 396,  c: 150, l: '396 g block',   a: 'chilled' },
    hummus:    { n: 'Hummus',              u: 'g',    p: 200,  c: 85,  l: '200 g tub',     a: 'chilled' },

    bread:     { n: 'Sliced bread',        u: 'each', p: 20,   c: 55,  l: '800 g loaf (about 20 slices)', a: 'bread', f: ['g'] },  // anchored: 55p at Tesco and Aldi (Sep 2026)
    wraps:     { n: 'Tortilla wraps',      u: 'each', p: 8,    c: 105, l: 'pack of 8',     a: 'bread', f: ['g'] },
    pitta:     { n: 'Pitta breads',        u: 'each', p: 6,    c: 70,  l: 'pack of 6',     a: 'bread', f: ['g'] },

    pasta:     { n: 'Pasta',               u: 'g',    p: 500,  c: 60,  l: '500 g bag',     a: 'cupboard', f: ['g'] },
    rice:      { n: 'Rice',                u: 'g',    p: 1000, c: 130, l: '1 kg bag',      a: 'cupboard' },
    ricepouch: { n: 'Microwave rice pouches', u: 'each', p: 2, c: 140, l: 'pack of 2',     a: 'cupboard' },
    noodles:   { n: 'Dried noodles',       u: 'g',    p: 300,  c: 95,  l: '300 g pack',    a: 'cupboard', f: ['g'] },
    tintom:    { n: 'Chopped tomatoes',    u: 'g',    p: 400,  c: 45,  l: '400 g tin',     a: 'cupboard' },
    beans:     { n: 'Baked beans',         u: 'g',    p: 420,  c: 30,  l: '420 g tin',     a: 'cupboard' },               // anchored: Aldi 420 g 27p
    kidney:    { n: 'Kidney beans',        u: 'g',    p: 400,  c: 60,  l: '400 g tin',     a: 'cupboard' },
    chickpeas: { n: 'Chickpeas',           u: 'g',    p: 400,  c: 50,  l: '400 g tin',     a: 'cupboard' },               // anchored: Aldi 45p
    mixbeans:  { n: 'Mixed beans',         u: 'g',    p: 400,  c: 70,  l: '400 g tin',     a: 'cupboard' },               // anchored: Aldi 69p
    lentils:   { n: 'Red lentils',         u: 'g',    p: 500,  c: 130, l: '500 g bag',     a: 'cupboard' },
    coconut:   { n: 'Coconut milk',        u: 'ml',   p: 400,  c: 85,  l: '400 ml tin',    a: 'cupboard' },
    sweetcorn: { n: 'Sweetcorn',           u: 'g',    p: 340,  c: 55,  l: '340 g tin',     a: 'cupboard' },
    tuna:      { n: 'Tuna',                u: 'g',    p: 145,  c: 95,  l: '145 g tin',     a: 'cupboard', f: ['fi'] },
    pb:        { n: 'Peanut butter',       u: 'g',    p: 340,  c: 140, l: '340 g jar',     a: 'cupboard', f: ['n'] },
    flour:     { n: 'Plain flour',         u: 'g',    p: 1500, c: 85,  l: '1.5 kg bag',    a: 'cupboard', f: ['g'] },
    oats:      { n: 'Porridge oats',        u: 'g',    p: 1000, c: 110, l: '1 kg bag',      a: 'cupboard', f: ['g'] },   // oats can carry gluten, so flagged
    cornflakes:{ n: 'Cornflakes or similar', u: 'g',   p: 500,  c: 100, l: '500 g box',     a: 'cupboard', f: ['g'] },
    jam:       { n: 'Jam',                 u: 'g',    p: 454,  c: 99,  l: '454 g jar',     a: 'cupboard' },               // Tesco jam 454 g 99p
    banana:    { n: 'Bananas',             u: 'each', p: 5,    c: 95,  l: 'bunch of 5',    a: 'veg' },
    berries:   { n: 'Frozen mixed berries', u: 'g',   p: 500,  c: 230, l: '500 g bag',     a: 'frozen' },

    peas:      { n: 'Frozen peas',         u: 'g',    p: 900,  c: 110, l: '900 g bag',     a: 'frozen' },
    mixveg:    { n: 'Frozen mixed veg',    u: 'g',    p: 1000, c: 108, l: '1 kg bag',      a: 'frozen' },                 // anchored: Aldi frozen veg 99p
    spinach:   { n: 'Frozen spinach',      u: 'g',    p: 800,  c: 135, l: '800 g bag',     a: 'frozen' },
    fishfing:  { n: 'Fish fingers',        u: 'each', p: 10,   c: 200, l: 'box of 10',     a: 'frozen', f: ['fi', 'g'] },

    oil:       { n: 'Cooking oil',         u: 'ml',   p: 1000, c: 230, l: '1 L bottle',    a: 'sauce' },
    stock:     { n: 'Stock cubes',         u: 'each', p: 12,   c: 100, l: 'box of 12',     a: 'sauce' },                  // Aldi box 99p (Oct 2025)
    soy:       { n: 'Soy sauce',           u: 'ml',   p: 150,  c: 85,  l: '150 ml bottle', a: 'sauce', f: ['g'] },
    curry:     { n: 'Curry powder',        u: 'g',    p: 40,   c: 90,  l: '40 g jar',      a: 'sauce' },
    paprika:   { n: 'Paprika or chilli powder', u: 'g', p: 40,  c: 85,  l: '40 g jar',      a: 'sauce' },
    herbs:     { n: 'Mixed herbs',         u: 'g',    p: 20,   c: 80,  l: '20 g jar',      a: 'sauce' }                   // Aldi Italian herbs 69p
  };

  // Ingredients that make sense as "what's in my fridge" for the Use it up tab.
  var FRIDGE_SKIP = { oil: 1, stock: 1, soy: 1, curry: 1, paprika: 1, herbs: 1 };

  // k: m microwave, h hob, o oven, a air fryer. An oven recipe with an af line also works in an air fryer.
  // t: br breakfast only, l lunch, d dinner, b lunch or dinner. bf: true also lets it be a breakfast. k: kit needed (m microwave, h hob, o oven). s: skill 0 none, 1 basic, 2 confident.
  // i: [ingredient, amount for ONE serving]. Meal cost is worked out from the ingredients.
  var RECIPES = [
    { id: 'jacket-beans-cheese', n: 'Jacket potato, beans and cheese', t: 'b', k: 'm', s: 0, m: 12,
      i: [['potato', 300], ['beans', 200], ['cheddar', 30]],
      st: ['Prick the potato all over with a fork. Microwave on high for 8 to 10 minutes, turning halfway, until soft.', 'Heat the beans in a bowl for 2 minutes.', 'Split the potato, pile on the beans and grate the cheese over the top.'] },
    { id: 'jacket-beans-corn', n: 'Jacket potato, beans and sweetcorn', t: 'b', k: 'm', s: 0, m: 12,
      i: [['potato', 300], ['beans', 200], ['sweetcorn', 60]],
      st: ['Prick the potato all over with a fork. Microwave on high for 8 to 10 minutes, turning halfway, until soft.', 'Mix the beans and drained sweetcorn in a bowl and microwave for 2 minutes.', 'Split the potato and pile the beans on top.'] },
    { id: 'cheese-tomato-toastie', n: 'Cheese and tomato toastie', t: 'l', k: 'h', s: 0, m: 10,
      i: [['bread', 2], ['cheddar', 40], ['tomatoes', 1]],
      st: ['Slice the tomato. Layer the cheese and tomato between the bread.', 'Fry in a dry non-stick pan on medium heat for 3 minutes each side, pressing down, until golden and melted.'] },
    { id: 'tuna-corn-wrap', n: 'Tuna and sweetcorn wrap', t: 'l', k: 'm', s: 0, m: 5,
      i: [['wraps', 2], ['tuna', 75], ['sweetcorn', 60], ['cucumber', 0.25]],
      st: ['Drain the tuna and sweetcorn and mix them together.', 'Slice the cucumber. Spoon everything onto a wrap, roll it up and eat.'] },
    { id: 'hummus-veg-wrap', n: 'Hummus and crunchy veg wrap', t: 'l', k: 'm', s: 0, m: 5,
      i: [['wraps', 2], ['hummus', 60], ['carrot', 60], ['cucumber', 0.25], ['tomatoes', 1]],
      st: ['Grate the carrot and slice the cucumber and tomato.', 'Spread hummus down the middle of a wrap, add the veg, roll it up tightly.'] },
    { id: 'egg-fried-rice-micro', n: 'Microwave egg fried rice', t: 'b', k: 'm', s: 1, m: 10,
      i: [['ricepouch', 1], ['eggs', 2], ['peas', 60], ['soy', 15], ['oil', 5]],
      st: ['Microwave the peas in a bowl for 2 minutes. Heat the rice pouch following the packet.', 'Beat the eggs with the oil in a mug and microwave in 30 second bursts, stirring, until just set.', 'Tip the rice, peas and egg into one bowl and stir through the soy sauce.'] },
    { id: 'fishfinger-sandwich', n: 'Fish finger sandwich with peas', t: 'l', k: 'o', af: 'Cook the fish fingers at 200°C for 8 to 10 minutes, turning halfway, or follow the box.', s: 0, m: 18,
      i: [['bread', 2], ['fishfing', 3], ['peas', 60]],
      st: ['Bake the fish fingers following the box (usually about 15 minutes at 200°C).', 'Microwave the peas for 2 minutes.', 'Make a sandwich with the fish fingers. Eat the peas on the side.'] },
    { id: 'veg-omelette-toast', n: 'Mushroom and cheese omelette with toast', t: 'b', bf: true, k: 'h', s: 1, m: 12,
      i: [['eggs', 3], ['mushroom', 60], ['cheddar', 20], ['bread', 2], ['oil', 5]],
      st: ['Slice the mushrooms and fry them in the oil for 3 minutes. Beat the eggs.', 'Pour the eggs over the mushrooms. When it is nearly set, sprinkle on the cheese and fold it over.', 'Make the toast and serve.'] },
    { id: 'egg-cheese-wrap', n: 'Scrambled egg and cheese wrap', t: 'l', bf: true, k: 'm', s: 0, m: 6,
      i: [['wraps', 2], ['eggs', 2], ['cheddar', 25], ['tomatoes', 1]],
      st: ['Beat the eggs in a mug and microwave in 30 second bursts, stirring, until just set.', 'Fill the wrap with the egg, grated cheese and sliced tomato, then roll it up.'] },
    { id: 'chickpea-tomato-toast', n: 'Chickpea and tomato salad on toast', t: 'l', k: 'm', s: 0, m: 6,
      i: [['chickpeas', 200], ['tomatoes', 2], ['cucumber', 0.5], ['bread', 2], ['oil', 5], ['herbs', 1]],
      st: ['Drain the chickpeas. Chop the tomatoes and cucumber.', 'Mix everything with the oil and herbs. Toast the bread and pile the salad on top.'] },
    { id: 'tomato-soup-toastie', n: 'Tomato soup with a cheese toastie', t: 'l', k: 'h', s: 0, m: 18,
      i: [['tintom', 400], ['onion', 0.5], ['stock', 1], ['bread', 2], ['cheddar', 30], ['oil', 5]],
      st: ['Chop the onion and soften it in the oil for 4 minutes.', 'Add the tomatoes, the stock cube and half a tin of water. Simmer for 8 minutes, then mash or blend.', 'Make a cheese toastie in a dry pan, 3 minutes each side. Dunk it in the soup.'] },
    { id: 'carrot-lentil-soup', n: 'Carrot and lentil soup', t: 'l', k: 'h', s: 1, m: 25,
      i: [['lentils', 50], ['carrot', 150], ['onion', 0.5], ['stock', 1], ['curry', 3], ['oil', 5]],
      st: ['Chop the onion and carrots. Soften them in the oil for 5 minutes with the curry powder.', 'Add the lentils, the stock cube and 500 ml water. Simmer for 20 minutes until the lentils are soft.', 'Mash or blend for a smoother soup.'] },
    { id: 'tomato-pasta-micro', n: 'Microwave tomato and veg pasta', t: 'd', k: 'm', s: 0, m: 15,
      i: [['pasta', 100], ['tintom', 200], ['mixveg', 100], ['herbs', 2], ['garlic', 1]],
      st: ['Put the pasta in a large microwave-safe bowl, cover with water and microwave for the time on the packet plus 2 minutes. Drain.', 'Mix the tomatoes, frozen veg, crushed garlic and herbs in another bowl. Microwave for 4 minutes.', 'Stir the sauce through the pasta.'] },
    { id: 'mac-cheese-micro', n: 'Microwave mac and cheese with peas', t: 'd', k: 'm', s: 0, m: 15,
      i: [['pasta', 90], ['milk', 150], ['cheddar', 50], ['peas', 50]],
      st: ['Microwave the pasta in plenty of water for the packet time plus 2 minutes. Drain.', 'Stir in the milk, grated cheese and peas. Microwave for 2 minutes in 1 minute bursts, stirring between.', 'Leave to stand for a minute so it thickens.'] },
    { id: 'veg-curry-rice-micro', n: 'Microwave chickpea veg curry and rice', t: 'd', k: 'm', s: 0, m: 10,
      i: [['ricepouch', 1], ['mixveg', 150], ['chickpeas', 150], ['tintom', 100], ['curry', 6]],
      st: ['Tip the frozen veg, drained chickpeas, tomatoes and curry powder into a bowl. Microwave for 5 minutes, stirring halfway.', 'Heat the rice pouch following the packet and serve the curry on top.'] },
    { id: 'chilli-sin-carne-micro', n: 'Microwave bean chilli and rice', t: 'd', k: 'm', s: 0, m: 12,
      i: [['kidney', 200], ['tintom', 200], ['sweetcorn', 50], ['mixveg', 80], ['ricepouch', 1], ['paprika', 4]],
      st: ['Tip the drained beans, tomatoes, sweetcorn, frozen veg and paprika into a bowl. Microwave for 6 minutes, stirring halfway.', 'Heat the rice pouch following the packet and serve the chilli on top.'] },
    { id: 'tomato-veg-pasta', n: 'Tomato and veg pasta', t: 'd', k: 'h', s: 0, m: 18,
      i: [['pasta', 100], ['tintom', 200], ['mixveg', 100], ['onion', 0.5], ['garlic', 1], ['herbs', 2], ['oil', 5], ['cheddar', 20]],
      st: ['Boil the pasta following the packet.', 'Meanwhile soften the chopped onion in the oil, add the garlic, tomatoes, frozen veg and herbs. Simmer for 10 minutes.', 'Drain the pasta, stir in the sauce and grate the cheese over the top.'] },
    { id: 'beef-chilli-rice', n: 'Beef chilli and rice', t: 'd', k: 'h', s: 1, m: 30,
      i: [['mince', 100], ['kidney', 200], ['tintom', 200], ['onion', 0.5], ['pepper', 0.5], ['paprika', 4], ['rice', 80], ['oil', 5]],
      st: ['Fry the chopped onion and mince in the oil until the mince is browned.', 'Add the chopped pepper, paprika, tomatoes and drained beans. Simmer for 20 minutes.', 'Cook the rice following the packet and serve the chilli on top.'] },
    { id: 'chicken-stirfry-noodles', n: 'Chicken and veg noodle stir-fry', t: 'd', k: 'h', s: 1, m: 20,
      i: [['chicken', 130], ['noodles', 90], ['mixveg', 120], ['soy', 20], ['garlic', 1], ['oil', 5]],
      st: ['Cook the noodles following the packet, then drain.', 'Slice the chicken and fry in the oil for 6 minutes until cooked through. Add the garlic and frozen veg for 4 minutes.', 'Add the noodles and soy sauce and toss until hot.'] },
    { id: 'peanut-tofu-noodles', n: 'Peanut noodles with tofu', t: 'd', k: 'h', s: 1, m: 20,
      i: [['noodles', 90], ['tofu', 130], ['carrot', 80], ['pb', 25], ['soy', 15], ['oil', 5], ['garlic', 1]],
      st: ['Cook the noodles following the packet, then drain. Cube the tofu and grate the carrot.', 'Fry the tofu in the oil until golden. Add the garlic.', 'Stir the peanut butter, soy sauce and a splash of hot water into a sauce. Toss with the noodles, tofu and carrot.'] },
    { id: 'sausage-mash-peas', n: 'Sausage, mash and peas', t: 'd', k: 'h', s: 1, m: 30,
      i: [['sausages', 3], ['potato', 250], ['peas', 80], ['milk', 30], ['oil', 5]],
      st: ['Peel and chop the potatoes, then boil for 15 minutes until soft.', 'Fry the sausages in the oil for 12 to 15 minutes, turning, until cooked through.', 'Drain and mash the potatoes with the milk. Boil the peas for 3 minutes and serve everything together.'] },
    { id: 'red-dal-rice', n: 'Red lentil dal and rice', t: 'd', k: 'h', s: 1, m: 30,
      i: [['lentils', 80], ['tintom', 100], ['coconut', 100], ['onion', 0.5], ['garlic', 2], ['curry', 8], ['rice', 70], ['oil', 5]],
      st: ['Soften the chopped onion and garlic in the oil with the curry powder.', 'Add the lentils, tomatoes, coconut milk and 200 ml water. Simmer for 20 minutes, stirring now and then.', 'Cook the rice following the packet and serve the dal on top.'] },
    { id: 'chicken-curry', n: 'Easy chicken curry and rice', t: 'd', k: 'h', s: 2, m: 40,
      i: [['chicken', 130], ['tintom', 200], ['yoghurt', 40], ['onion', 0.5], ['garlic', 2], ['curry', 8], ['rice', 80], ['oil', 5]],
      st: ['Soften the chopped onion in the oil, then add the garlic and curry powder for 1 minute.', 'Add the diced chicken and brown it, then pour in the tomatoes. Simmer for 20 minutes until the chicken is cooked through.', 'Take it off the heat and stir in the yoghurt. Serve with the cooked rice.'] },
    { id: 'spicy-chicken-rice-bowl', n: 'Spicy chicken rice bowl', t: 'd', k: 'h', s: 1, m: 25,
      i: [['chicken', 130], ['rice', 80], ['pepper', 0.5], ['onion', 0.5], ['paprika', 4], ['sweetcorn', 60], ['oil', 5]],
      st: ['Start the rice following the packet.', 'Fry the sliced chicken, onion and pepper in the oil with the paprika for 8 to 10 minutes until the chicken is cooked through.', 'Stir in the sweetcorn for 2 minutes and serve over the rice.'] },
    { id: 'sweetpot-chickpea-curry', n: 'Sweet potato and chickpea curry', t: 'd', k: 'h', s: 1, m: 35,
      i: [['sweetpot', 200], ['chickpeas', 150], ['coconut', 100], ['onion', 0.5], ['curry', 6], ['rice', 70], ['spinach', 50], ['oil', 5]],
      st: ['Soften the chopped onion in the oil with the curry powder. Add the diced sweet potato.', 'Add the drained chickpeas, coconut milk and 100 ml water. Simmer for 20 minutes until the sweet potato is soft.', 'Stir in the spinach for the last 3 minutes. Serve with the cooked rice.'] },
    { id: 'chickpea-spinach-curry', n: 'Chickpea and spinach curry', t: 'd', k: 'h', s: 1, m: 25,
      i: [['chickpeas', 200], ['tintom', 200], ['spinach', 80], ['onion', 0.5], ['garlic', 1], ['curry', 6], ['rice', 80], ['oil', 5]],
      st: ['Soften the chopped onion and garlic in the oil with the curry powder.', 'Add the tomatoes and drained chickpeas and simmer for 10 minutes. Stir in the spinach for the last 3 minutes.', 'Serve with the cooked rice.'] },
    { id: 'creamy-tuna-pasta', n: 'Tuna and sweetcorn pasta', t: 'd', k: 'h', s: 1, m: 20,
      i: [['pasta', 100], ['tuna', 145], ['tintom', 150], ['sweetcorn', 50], ['herbs', 2]],
      st: ['Boil the pasta following the packet.', 'Warm the tomatoes with the herbs for 5 minutes, then stir in the drained tuna and sweetcorn.', 'Drain the pasta and mix it into the sauce.'] },
    { id: 'mushroom-spinach-pasta', n: 'Creamy mushroom and spinach pasta', t: 'd', k: 'h', s: 1, m: 20,
      i: [['pasta', 100], ['mushroom', 100], ['spinach', 60], ['garlic', 1], ['milk', 50], ['cheddar', 20], ['oil', 5]],
      st: ['Boil the pasta following the packet.', 'Fry the sliced mushrooms in the oil for 5 minutes, then add the garlic and spinach until the spinach has thawed.', 'Add the milk and cheese and stir until it makes a light sauce. Toss with the drained pasta.'] },
    { id: 'tofu-veg-stirfry-rice', n: 'Tofu and veg stir-fry with rice', t: 'd', k: 'h', s: 1, m: 20,
      i: [['tofu', 130], ['mixveg', 150], ['soy', 20], ['rice', 80], ['garlic', 1], ['oil', 5]],
      st: ['Start the rice following the packet.', 'Cube the tofu and fry in the oil until golden. Add the garlic and frozen veg for 5 minutes.', 'Stir in the soy sauce and serve over the rice.'] },
    { id: 'sheet-pan-chicken', n: 'Sheet pan chicken and roast veg', t: 'd', k: 'o', af: 'Cut the chicken and veg smaller. Cook at 190°C for 20 to 25 minutes, shaking the basket halfway, until the chicken is cooked through with no pink inside. Do it in two batches if the basket is crowded.', s: 1, m: 45,
      i: [['chicken', 150], ['potato', 250], ['carrot', 100], ['pepper', 0.5], ['oil', 10], ['paprika', 3]],
      st: ['Heat the oven to 200°C. Chop the potato, carrot and pepper into chunky pieces.', 'Toss everything on a tray with the oil and paprika. Roast for 40 minutes, turning once, until the chicken is cooked through with no pink inside.'] },
    { id: 'baked-feta-pasta', n: 'Baked feta and tomato pasta', t: 'd', k: 'o', s: 1, m: 35,
      i: [['pasta', 100], ['feta', 60], ['tomatoes', 3], ['garlic', 1], ['oil', 10], ['herbs', 1]],
      st: ['Heat the oven to 200°C. Put the tomatoes, feta and crushed garlic in a dish with the oil and herbs. Bake for 25 minutes.', 'Boil the pasta following the packet and drain it.', 'Mash the feta and tomatoes together into a sauce and stir through the pasta.'] },
    { id: 'sausage-traybake', n: 'Sausage and veg traybake', t: 'd', k: 'o', af: 'Cook the sausages and chopped veg at 190°C for 18 to 22 minutes, shaking halfway, until the sausages are cooked through.', s: 0, m: 40,
      i: [['sausages', 3], ['potato', 200], ['pepper', 0.5], ['onion', 0.5], ['oil', 10], ['herbs', 2]],
      st: ['Heat the oven to 200°C. Chop the potato, pepper and onion into chunks.', 'Put everything on a tray with the sausages, oil and herbs. Roast for 35 to 40 minutes, turning once, until the sausages are cooked through.'] },
    { id: 'cottage-pie', n: 'Cottage pie', t: 'd', k: 'o', s: 2, m: 60,
      i: [['mince', 120], ['potato', 300], ['carrot', 80], ['onion', 0.5], ['tintom', 150], ['stock', 0.5], ['milk', 30], ['oil', 5]],
      st: ['Peel and boil the potatoes for 15 minutes. Heat the oven to 200°C.', 'Fry the chopped onion and carrot in the oil, add the mince and brown it. Add the tomatoes and stock cube and simmer for 15 minutes.', 'Mash the potatoes with the milk. Put the mince in a dish, cover with the mash and bake for 20 minutes until golden.'] },

    /* ---- Microwave and no-cook ---- */
    { id: 'hummus-pitta-salad', n: 'Hummus pitta with crunchy salad', t: 'l', k: 'm', s: 0, m: 5,
      i: [['pitta', 2], ['hummus', 60], ['cucumber', 0.25], ['tomatoes', 1], ['carrot', 40]],
      st: ['Slice the cucumber and tomato and grate the carrot.', 'Warm the pittas for 20 seconds in the microwave, split them and spread with hummus. Stuff with the salad.'] },
    { id: 'bean-corn-burrito', n: 'Bean and sweetcorn burrito', t: 'l', k: 'm', s: 0, m: 8,
      i: [['wraps', 2], ['kidney', 150], ['sweetcorn', 50], ['tomatoes', 1], ['paprika', 2]],
      st: ['Drain the beans and sweetcorn. Mix them with the paprika and chopped tomato in a bowl and microwave for 2 minutes.', 'Spoon the filling down the middle of a wrap, fold in the ends and roll it up.'] },
    { id: 'tuna-pasta-salad', n: 'Tuna and sweetcorn pasta salad', t: 'l', k: 'm', s: 0, m: 15,
      i: [['pasta', 80], ['tuna', 75], ['sweetcorn', 50], ['cucumber', 0.25], ['herbs', 1]],
      st: ['Microwave the pasta in plenty of water for the packet time plus 2 minutes. Drain and rinse under cold water.', 'Mix in the drained tuna and sweetcorn, the chopped cucumber and the herbs. Good hot or cold, so you can pack it for later.'] },
    { id: 'cheesy-beans-toast', n: 'Cheesy beans on toast', t: 'b', bf: true, k: 'm', s: 0, m: 6,
      i: [['bread', 2], ['beans', 200], ['cheddar', 20]],
      st: ['Toast the bread.', 'Heat the beans in a bowl for 2 minutes. Pour them over the toast and grate the cheese on top.'] },
    { id: 'mug-omelette-toast', n: 'Microwave omelette and toast', t: 'l', bf: true, k: 'm', s: 0, m: 6,
      i: [['eggs', 3], ['cheddar', 20], ['tomatoes', 1], ['bread', 2]],
      st: ['Beat the eggs in a large mug or bowl. Add the chopped tomato and grated cheese.', 'Microwave for 1 minute, stir, then microwave in 30 second bursts until set. Serve with toast.'] },
    { id: 'spiced-chickpea-wrap', n: 'Spiced chickpea and yoghurt wrap', t: 'l', k: 'm', s: 0, m: 8,
      i: [['wraps', 2], ['chickpeas', 150], ['yoghurt', 30], ['cucumber', 0.25], ['curry', 3]],
      st: ['Drain the chickpeas, mix with the curry powder and microwave for 1 to 2 minutes. Lightly mash some of them.', 'Spoon onto a wrap with the yoghurt and sliced cucumber, then roll it up.'] },
    { id: 'sweetpot-chickpea-micro', n: 'Microwave sweet potato with spiced chickpeas', t: 'b', k: 'm', s: 0, m: 14,
      i: [['sweetpot', 300], ['chickpeas', 150], ['paprika', 3], ['spinach', 40]],
      st: ['Prick the sweet potato all over and microwave for 8 to 10 minutes, turning halfway, until soft.', 'Mix the drained chickpeas, paprika and frozen spinach in a bowl and microwave for 3 minutes.', 'Split the sweet potato and pile the chickpeas on top.'] },
    { id: 'micro-peanut-noodles', n: 'Peanut noodles with crunchy veg', t: 'd', k: 'm', s: 0, m: 12,
      i: [['noodles', 80], ['pb', 25], ['soy', 15], ['carrot', 60], ['mixveg', 60]],
      st: ['Put the noodles and frozen veg in a bowl, cover with just-boiled water and leave for 5 minutes. Drain.', 'Stir the peanut butter, soy sauce and a splash of hot water together, then toss it through the noodles. Add grated carrot on top.'] },
    { id: 'micro-tuna-rice', n: 'Tuna and sweetcorn rice bowl', t: 'd', k: 'm', s: 0, m: 8,
      i: [['ricepouch', 1], ['tuna', 75], ['sweetcorn', 60], ['peas', 40], ['soy', 10]],
      st: ['Heat the rice pouch following the packet. Microwave the peas for 2 minutes.', 'Mix the rice, drained tuna, sweetcorn and peas in a bowl and stir through the soy sauce.'] },
    { id: 'micro-lentil-dal', n: 'Microwave red lentil dal', t: 'd', k: 'm', s: 1, m: 22,
      i: [['lentils', 60], ['tintom', 150], ['coconut', 80], ['curry', 6], ['ricepouch', 1]],
      st: ['Rinse the lentils. Put them in a large deep bowl with the tomatoes, coconut milk, curry powder and 200 ml water.', 'Cover loosely and microwave for 15 minutes, stirring every 5 minutes, until the lentils are soft. Add a splash of water if it gets too thick.', 'Heat the rice pouch following the packet and serve the dal on top.'] },
    { id: 'micro-chilli-jacket', n: 'Chilli bean jacket potato', t: 'b', k: 'm', s: 0, m: 14,
      i: [['potato', 300], ['kidney', 150], ['tintom', 100], ['paprika', 3]],
      st: ['Prick the potato all over and microwave for 8 to 10 minutes, turning halfway, until soft.', 'Mix the drained beans, tomatoes and paprika in a bowl and microwave for 3 minutes.', 'Split the potato and pour the chilli over the top.'] },
    { id: 'jacket-tuna-corn', n: 'Jacket potato with tuna, sweetcorn and cheese', t: 'b', k: 'm', s: 0, m: 12,
      i: [['potato', 300], ['tuna', 75], ['sweetcorn', 50], ['cheddar', 20]],
      st: ['Prick the potato all over and microwave for 8 to 10 minutes, turning halfway, until soft.', 'Mix the drained tuna and sweetcorn. Split the potato, fill it and grate the cheese over the top.'] },

    /* ---- Hob ---- */
    { id: 'cheese-spinach-pancakes', n: 'Cheese and spinach pancakes', t: 'l', k: 'h', s: 1, m: 20,
      i: [['flour', 60], ['eggs', 1], ['milk', 150], ['spinach', 40], ['cheddar', 30], ['oil', 5]],
      st: ['Whisk the flour, egg and milk into a smooth batter. Thaw the spinach and squeeze it dry.', 'Heat a little oil in a frying pan and pour in a thin layer of batter. Cook for 1 to 2 minutes each side. Repeat to make 2 or 3 pancakes.', 'Fill with spinach and grated cheese, then fold.'] },
    { id: 'veg-fried-rice', n: 'Egg and veg fried rice', t: 'd', k: 'h', s: 1, m: 20,
      i: [['rice', 80], ['eggs', 2], ['mixveg', 100], ['soy', 15], ['garlic', 1], ['oil', 5]],
      st: ['Cook the rice following the packet, drain it and let it steam dry.', 'Fry the garlic and frozen veg in the oil for 4 minutes. Push to one side, add the beaten eggs and scramble them.', 'Add the rice and soy sauce and stir everything over a high heat for 2 minutes.'] },
    { id: 'bean-cabbage-stew', n: 'Bean and cabbage stew', t: 'd', k: 'h', s: 1, m: 30,
      i: [['mixbeans', 200], ['cabbage', 100], ['carrot', 80], ['onion', 0.5], ['stock', 1], ['tintom', 150], ['oil', 5], ['herbs', 1]],
      st: ['Soften the chopped onion and carrot in the oil for 5 minutes.', 'Add the drained beans, tomatoes, stock cube, herbs and 150 ml water. Simmer for 10 minutes.', 'Stir in the shredded cabbage and cook for 8 minutes more, until soft.'] },
    { id: 'egg-noodle-soup', n: 'Egg noodle soup', t: 'l', k: 'h', s: 1, m: 15,
      i: [['noodles', 60], ['mixveg', 100], ['stock', 1], ['soy', 10], ['eggs', 1]],
      st: ['Bring 400 ml water to the boil with the stock cube and soy sauce.', 'Add the noodles and frozen veg and simmer for 4 minutes.', 'Crack in the egg and stir gently until it cooks into ribbons.'] },
    { id: 'garlic-broccoli-pasta', n: 'Garlic broccoli pasta', t: 'd', k: 'h', s: 1, m: 20,
      i: [['pasta', 100], ['broccoli', 120], ['garlic', 2], ['oil', 10], ['cheddar', 20], ['paprika', 1]],
      st: ['Boil the pasta following the packet. Add the broccoli florets for the last 4 minutes.', 'Meanwhile warm the oil, sliced garlic and chilli powder for 1 minute.', 'Drain, toss everything together and grate the cheese over the top.'] },
    { id: 'egg-fried-noodles', n: 'Egg fried noodles', t: 'd', k: 'h', s: 1, m: 18,
      i: [['noodles', 90], ['eggs', 2], ['mixveg', 100], ['soy', 15], ['garlic', 1], ['oil', 5]],
      st: ['Cook the noodles following the packet and drain.', 'Fry the garlic and frozen veg in the oil for 4 minutes. Push to the side and scramble in the eggs.', 'Add the noodles and soy sauce and toss over a high heat for 2 minutes.'] },
    { id: 'sausage-bean-stew', n: 'Sausage and bean stew with mash', t: 'd', k: 'h', s: 1, m: 35,
      i: [['sausages', 3], ['mixbeans', 150], ['tintom', 200], ['onion', 0.5], ['potato', 200]],
      st: ['Peel and chop the potato, boil for 15 minutes until soft, then drain and mash.', 'Meanwhile brown the sausages in a pan with the chopped onion, turning for 8 minutes.', 'Add the tomatoes and drained beans. Simmer for 10 minutes, until the sausages are cooked through. Serve with the mash.'] },
    { id: 'lentil-bolognese', n: 'Lentil bolognese', t: 'd', k: 'h', s: 1, m: 30,
      i: [['lentils', 70], ['tintom', 200], ['pasta', 100], ['onion', 0.5], ['carrot', 80], ['garlic', 1], ['herbs', 2], ['oil', 5]],
      st: ['Soften the chopped onion, grated carrot and garlic in the oil for 5 minutes.', 'Add the lentils, tomatoes, herbs and 200 ml water. Simmer for 20 minutes, stirring now and then.', 'Boil the pasta following the packet and serve the sauce on top.'] },
    { id: 'beef-bolognese', n: 'Spaghetti bolognese', t: 'd', k: 'h', s: 1, m: 35,
      i: [['mince', 100], ['tintom', 200], ['pasta', 100], ['onion', 0.5], ['carrot', 60], ['garlic', 1], ['herbs', 2], ['oil', 5]],
      st: ['Fry the chopped onion in the oil for 4 minutes. Add the mince and brown it, breaking it up.', 'Add the grated carrot, garlic, tomatoes and herbs. Simmer for 20 minutes.', 'Boil the pasta following the packet and serve the sauce on top.'] },
    { id: 'chicken-fried-rice', n: 'Chicken fried rice', t: 'd', k: 'h', s: 1, m: 25,
      i: [['chicken', 120], ['rice', 80], ['peas', 60], ['eggs', 1], ['soy', 15], ['oil', 5], ['garlic', 1]],
      st: ['Cook the rice following the packet, drain and let it steam dry.', 'Fry the diced chicken in the oil for 6 to 8 minutes until cooked through, with no pink inside. Add the garlic and peas for 2 minutes.', 'Push to one side, scramble in the egg, then stir in the rice and soy sauce.'] },
    { id: 'veg-chilli-rice', n: 'Three bean chilli and rice', t: 'd', k: 'h', s: 1, m: 30,
      i: [['kidney', 200], ['tintom', 200], ['pepper', 0.5], ['onion', 0.5], ['paprika', 4], ['rice', 80], ['oil', 5], ['sweetcorn', 40]],
      st: ['Soften the chopped onion and pepper in the oil for 5 minutes. Add the paprika.', 'Add the drained beans, tomatoes and sweetcorn. Simmer for 15 minutes.', 'Cook the rice following the packet and serve the chilli on top.'] },
    { id: 'chickpea-shakshuka', n: 'Chickpea shakshuka with toast', t: 'b', bf: true, k: 'h', s: 1, m: 25,
      i: [['eggs', 2], ['chickpeas', 150], ['tintom', 200], ['onion', 0.5], ['pepper', 0.5], ['paprika', 3], ['bread', 2], ['oil', 5]],
      st: ['Soften the chopped onion and pepper in the oil with the paprika for 5 minutes.', 'Add the tomatoes and drained chickpeas and simmer for 8 minutes.', 'Make two dips in the sauce, crack in the eggs, cover and cook for 5 minutes until the whites are set. Serve with toast.'] },
    { id: 'potato-egg-hash', n: 'Potato, pepper and egg hash', t: 'b', bf: true, k: 'h', s: 1, m: 30,
      i: [['potato', 250], ['eggs', 2], ['pepper', 0.5], ['onion', 0.5], ['oil', 10]],
      st: ['Dice the potato small and boil for 6 minutes. Drain well.', 'Fry the potato, chopped onion and pepper in the oil for 10 minutes, turning, until crisp.', 'Make two gaps, crack in the eggs, cover and cook for 3 to 4 minutes.'] },
    { id: 'coconut-lentil-soup', n: 'Coconut lentil soup', t: 'l', k: 'h', s: 1, m: 25,
      i: [['lentils', 50], ['coconut', 100], ['carrot', 100], ['onion', 0.5], ['curry', 5], ['stock', 1]],
      st: ['Soften the chopped onion and carrot in a pan with the curry powder for 5 minutes.', 'Add the lentils, coconut milk, stock cube and 350 ml water. Simmer for 20 minutes until the lentils are soft.', 'Mash or blend for a smoother soup.'] },

    /* ---- Oven ---- */
    { id: 'broccoli-pasta-bake', n: 'Cheesy broccoli pasta bake', t: 'd', k: 'o', s: 2, m: 45,
      i: [['pasta', 100], ['broccoli', 120], ['cheddar', 50], ['milk', 100], ['flour', 15], ['oil', 10]],
      st: ['Heat the oven to 200°C. Boil the pasta for 8 minutes, adding the broccoli for the last 3. Drain.', 'For the sauce, stir the flour into the oil in a pan for 1 minute, then slowly whisk in the milk until it thickens. Stir in half the cheese.', 'Mix the sauce with the pasta and broccoli in a dish, top with the rest of the cheese and bake for 20 minutes until golden.'] },
    { id: 'chickpea-tray-roast', n: 'Roast sweet potato and chickpea tray', t: 'd', k: 'o', af: 'Pat the chickpeas dry. Cook everything at 200°C for 15 to 18 minutes, shaking halfway, until crisp at the edges.', s: 0, m: 40,
      i: [['chickpeas', 150], ['sweetpot', 200], ['pepper', 0.5], ['onion', 0.5], ['oil', 10], ['paprika', 3]],
      st: ['Heat the oven to 200°C. Chop the sweet potato, pepper and onion into chunks.', 'Toss them on a tray with the drained chickpeas, oil and paprika. Roast for 35 minutes, turning once, until the sweet potato is soft and the edges are crisp.'] },
    { id: 'chicken-sweetpot-traybake', n: 'Chicken and sweet potato traybake', t: 'd', k: 'o', af: 'Cut everything smaller. Cook at 190°C for 20 to 25 minutes, shaking halfway, until the chicken is cooked through with no pink inside.', s: 1, m: 45,
      i: [['chicken', 150], ['sweetpot', 250], ['pepper', 0.5], ['onion', 0.5], ['oil', 10], ['paprika', 3]],
      st: ['Heat the oven to 200°C. Chop the sweet potato, pepper and onion into chunks.', 'Toss everything on a tray with the chicken, oil and paprika. Roast for 35 to 40 minutes, turning once, until the chicken is cooked through with no pink inside.'] },
    { id: 'fishfinger-wedges', n: 'Fish fingers, wedges and peas', t: 'd', k: 'o', af: 'Cook the wedges at 200°C for 15 minutes, add the fish fingers and cook for another 8 to 10 minutes, shaking halfway.', s: 0, m: 35,
      i: [['fishfing', 4], ['potato', 250], ['peas', 80], ['oil', 10]],
      st: ['Heat the oven to 200°C. Cut the potato into wedges, toss with the oil and roast for 20 minutes.', 'Add the fish fingers to the tray and cook for another 15 minutes, or following the box.', 'Boil or microwave the peas for 3 minutes and serve.'] },
    { id: 'lentil-shepherds-pie', n: 'Lentil shepherds pie', t: 'd', k: 'o', s: 2, m: 60,
      i: [['lentils', 60], ['tintom', 150], ['carrot', 80], ['onion', 0.5], ['potato', 300], ['stock', 1], ['oil', 10]],
      st: ['Peel and boil the potatoes for 15 minutes. Heat the oven to 200°C.', 'Soften the chopped onion and carrot in half the oil. Add the lentils, tomatoes, stock cube and 200 ml water and simmer for 20 minutes.', 'Mash the potatoes with the rest of the oil. Put the lentil mix in a dish, cover with the mash and bake for 20 minutes until golden.'] },
    /* ---- Breakfast ---- */
    { id: 'porridge-banana-micro', n: 'Microwave porridge with banana', t: 'br', k: 'm', s: 0, m: 5,
      i: [['oats', 50], ['milk', 200], ['banana', 1]],
      st: ['Put the oats and milk in a big microwave-safe bowl. Porridge bubbles up, so use more room than you think.', 'Microwave for 2 minutes, stir, then 30 seconds more until thick.', 'Slice the banana on top.'] },
    { id: 'porridge-berries-water', n: 'Berry porridge made with water', t: 'br', k: 'm', s: 0, m: 5,
      i: [['oats', 50], ['berries', 60]],
      st: ['Put the oats and 250 ml water in a big microwave-safe bowl. Microwave for 2 minutes, stir, then 30 seconds more.', 'Stir in the frozen berries. They thaw in about a minute and turn the porridge purple.'] },
    { id: 'pb-banana-porridge', n: 'Peanut butter and banana porridge', t: 'br', k: 'm', s: 0, m: 5,
      i: [['oats', 50], ['banana', 1], ['pb', 15]],
      st: ['Put the oats and 250 ml water in a big microwave-safe bowl. Microwave for 2 minutes, stir, then 30 seconds more.', 'Stir in the peanut butter and top with sliced banana.'] },
    { id: 'peanut-banana-toast', n: 'Peanut butter and banana toast', t: 'br', k: 'm', s: 0, m: 4,
      i: [['bread', 2], ['pb', 20], ['banana', 1]],
      st: ['Toast the bread.', 'Spread with peanut butter and top with sliced banana.'] },
    { id: 'jam-banana-toast', n: 'Toast with jam and a banana', t: 'br', k: 'm', s: 0, m: 4,
      i: [['bread', 2], ['jam', 30], ['banana', 1]],
      st: ['Toast the bread and spread with jam.', 'Eat the banana on the side.'] },
    { id: 'cereal-banana', n: 'Cereal with milk and banana', t: 'br', k: 'm', s: 0, m: 2,
      i: [['cornflakes', 50], ['milk', 150], ['banana', 1]],
      st: ['Pour the cereal into a bowl, add the milk and slice the banana on top.'] },
    { id: 'overnight-oats', n: 'Overnight oats with berries', t: 'br', k: 'm', s: 0, m: 5,
      i: [['oats', 40], ['milk', 100], ['yoghurt', 50], ['berries', 60]],
      st: ['The night before, mix the oats, milk and yoghurt in a jar or tub. Put the frozen berries on top.', 'Cover and leave in the fridge overnight. Eat it cold, or microwave for 1 minute if you want it warm.'] },
    { id: 'scrambled-eggs-toast-micro', n: 'Microwave scrambled eggs on toast', t: 'br', k: 'm', s: 0, m: 6,
      i: [['eggs', 2], ['bread', 2], ['milk', 20]],
      st: ['Beat the eggs with the milk in a mug or small bowl.', 'Microwave for 40 seconds, stir, then in 20 second bursts until just set. Toast the bread in the meantime.', 'Pile the eggs on the toast.'] },
    { id: 'yoghurt-berry-banana', n: 'Yoghurt with berries and banana', t: 'br', k: 'm', s: 0, m: 3,
      i: [['yoghurt', 150], ['berries', 80], ['banana', 1]],
      st: ['Spoon the yoghurt into a bowl. Add the frozen berries, which thaw as you eat, and the sliced banana.'] },
    { id: 'egg-tomato-scramble', n: 'Scrambled eggs with tomato', t: 'br', k: 'm', s: 0, m: 6,
      i: [['eggs', 3], ['tomatoes', 2]],
      st: ['Chop the tomatoes and microwave them in a bowl for 1 minute.', 'Beat the eggs, pour them over the tomatoes and microwave in 30 second bursts, stirring each time, until just set.'] },
    { id: 'hummus-tomato-toast', n: 'Hummus and tomato on toast', t: 'br', k: 'm', s: 0, m: 4,
      i: [['bread', 2], ['hummus', 50], ['tomatoes', 1]],
      st: ['Toast the bread, spread with hummus and top with sliced tomato.'] },
    { id: 'beans-on-toast', n: 'Beans on toast', t: 'b', bf: true, k: 'm', s: 0, m: 5,
      i: [['bread', 2], ['beans', 200]],
      st: ['Toast the bread.', 'Heat the beans in a bowl for 2 minutes, stirring halfway, then pour over the toast.'] },
    { id: 'fruit-bowl', n: 'Banana and berry bowl', t: 'br', k: 'm', s: 0, m: 3,
      i: [['banana', 2], ['berries', 100]],
      st: ['Slice the bananas into a bowl and add the frozen berries. They thaw in a few minutes. Light, so this one suits a quick morning.'] },
    { id: 'banana-pancakes', n: 'Banana pancakes', t: 'br', k: 'h', s: 1, m: 15,
      i: [['flour', 60], ['eggs', 1], ['milk', 120], ['banana', 1], ['oil', 5]],
      st: ['Mash half the banana. Whisk it with the flour, egg and milk into a smooth batter.', 'Heat a little oil in a frying pan on medium heat. Pour in small ladles of batter and cook for 2 minutes on each side until golden.', 'Top with the rest of the banana, sliced.'] },
    { id: 'french-toast', n: 'French toast with jam', t: 'br', k: 'h', s: 1, m: 12,
      i: [['bread', 3], ['eggs', 2], ['milk', 50], ['jam', 20], ['oil', 5]],
      st: ['Whisk the eggs and milk in a shallow dish. Dip each slice of bread so it soaks up the mix.', 'Fry in the oil on medium heat for 2 to 3 minutes each side until golden.', 'Serve with the jam.'] },
    { id: 'egg-beans-toast', n: 'Fried egg, beans and toast', t: 'br', k: 'h', s: 1, m: 10,
      i: [['eggs', 2], ['bread', 2], ['beans', 150], ['oil', 5]],
      st: ['Warm the beans in a small pan. Toast the bread.', 'Fry the eggs in the oil until the whites are set and the yolks are how you like them.', 'Serve everything together.'] },
    { id: 'mushroom-tomato-toast', n: 'Garlicky mushrooms and tomato on toast', t: 'br', k: 'h', s: 1, m: 12,
      i: [['mushroom', 80], ['tomatoes', 1], ['bread', 2], ['oil', 5], ['garlic', 1]],
      st: ['Slice the mushrooms and tomato. Fry the mushrooms in the oil for 5 minutes, then add the crushed garlic and tomato for 2 minutes.', 'Toast the bread and pile the mushrooms on top.'] },
    { id: 'tofu-scramble-toast', n: 'Tofu scramble on toast', t: 'br', k: 'h', s: 1, m: 12,
      i: [['tofu', 130], ['bread', 2], ['tomatoes', 1], ['curry', 2], ['oil', 5]],
      st: ['Crumble the tofu into a pan with the oil and fry for 5 minutes. Add the curry powder and chopped tomato for 2 minutes.', 'Toast the bread and spoon the scramble over it.'] },
    { id: 'sausage-sandwich', n: 'Sausage sandwich', t: 'br', k: 'h', s: 1, m: 15,
      i: [['sausages', 2], ['bread', 2], ['oil', 3]],
      st: ['Fry the sausages in the oil on medium heat for 12 to 15 minutes, turning, until cooked through with no pink inside.', 'Put them in the bread, splitting the sausages if you like.'] },
    /* ---- Air fryer (needs an air fryer; microwave rice pouches and similar are fine too) ---- */
    { id: 'air-fryer-sausage-egg', n: 'Air fryer sausage, egg and toast', t: 'br', k: 'a', s: 1, m: 15,
      i: [['sausages', 2], ['eggs', 2], ['bread', 2]],
      st: ['Cook the sausages in the air fryer at 180°C for 10 minutes, turning once.', 'Crack the eggs into oiled silicone cups or small ramekins, add them to the basket and cook for 6 to 8 minutes, until the whites are set.', 'Toast the bread in the basket for the last 2 to 3 minutes, or in a toaster, and serve everything together. Make sure the sausages are cooked through with no pink inside.'] },
    { id: 'air-fryer-potato-egg', n: 'Crispy potatoes with a fried egg', t: 'b', bf: true, k: 'a', s: 1, m: 25,
      i: [['potato', 250], ['eggs', 2], ['oil', 5], ['paprika', 2]],
      st: ['Cut the potatoes into small cubes and toss with the oil and paprika.', 'Cook in the air fryer at 200°C for 15 to 18 minutes, shaking the basket every 5 minutes.', 'Crack the eggs into oiled silicone cups, add them for the last 6 minutes, and serve on the potatoes.'] },
    { id: 'air-fryer-toastie', n: 'Air fryer cheese and tomato toastie', t: 'l', bf: true, k: 'a', s: 0, m: 8,
      i: [['bread', 2], ['cheddar', 40], ['tomatoes', 1]],
      st: ['Layer the cheese and sliced tomato between the bread.', 'Cook in the air fryer at 180°C for 5 to 6 minutes, flipping halfway, until golden and melted.'] },
    { id: 'air-fryer-jacket', n: 'Air fryer jacket potato with beans and cheese', t: 'b', k: 'a', s: 0, m: 45,
      i: [['potato', 300], ['beans', 200], ['cheddar', 30]],
      st: ['Prick the potato all over with a fork and rub with a drop of oil if you have some.', 'Cook in the air fryer at 200°C for 35 to 40 minutes, turning once, until the skin is crisp and the inside is soft.', 'Warm the beans in the microwave for 2 minutes. Split the potato, add the beans and grate the cheese over the top.'] },
    { id: 'air-fryer-chickpea-wrap', n: 'Crispy chickpea wrap', t: 'l', k: 'a', s: 0, m: 20,
      i: [['chickpeas', 150], ['wraps', 2], ['paprika', 2], ['oil', 5], ['yoghurt', 30], ['cucumber', 0.25]],
      st: ['Drain the chickpeas, pat them dry and toss with the oil and paprika.', 'Cook in the air fryer at 200°C for 12 to 15 minutes, shaking halfway, until crisp.', 'Spoon into a wrap with the yoghurt and sliced cucumber, then roll it up.'] },
    { id: 'air-fryer-fishfinger-wrap', n: 'Fish finger wrap', t: 'l', k: 'a', s: 0, m: 15,
      i: [['fishfing', 3], ['wraps', 2], ['cucumber', 0.25], ['yoghurt', 20]],
      st: ['Cook the fish fingers in the air fryer at 200°C for 8 to 10 minutes, turning halfway, or follow the box.', 'Put them in a wrap with sliced cucumber and the yoghurt, then roll it up.'] },
    { id: 'air-fryer-quesadilla', n: 'Cheese and bean quesadilla', t: 'l', k: 'a', s: 0, m: 10,
      i: [['wraps', 2], ['cheddar', 40], ['kidney', 100], ['sweetcorn', 30]],
      st: ['Spread the drained beans, sweetcorn and grated cheese over one wrap. Put the other wrap on top.', 'Cook in the air fryer at 190°C for 5 to 6 minutes, flipping halfway, until crisp and the cheese has melted. Cut into wedges.'] },
    { id: 'air-fryer-chicken-wedges', n: 'Crispy chicken, wedges and peas', t: 'd', k: 'a', s: 1, m: 30,
      i: [['chicken', 150], ['potato', 250], ['paprika', 3], ['oil', 10], ['peas', 80]],
      st: ['Cut the potato into wedges and toss with half the oil and paprika. Cook in the air fryer at 200°C for 10 minutes.', 'Slice the chicken into strips, toss with the rest of the oil and paprika and add to the basket. Cook for 12 to 15 minutes more, shaking halfway, until the chicken is cooked through with no pink inside.', 'Microwave the peas for 3 minutes and serve.'] },
    { id: 'air-fryer-sausage-potatoes', n: 'Air fryer sausages, potatoes and peppers', t: 'd', k: 'a', s: 0, m: 30,
      i: [['sausages', 3], ['potato', 250], ['pepper', 0.5], ['oil', 5]],
      st: ['Chop the potato and pepper into chunks and toss with the oil.', 'Cook the potato in the air fryer at 190°C for 10 minutes, then add the sausages and pepper.', 'Cook for 12 to 15 minutes more, shaking halfway, until the sausages are cooked through with no pink inside.'] },
    { id: 'air-fryer-crispy-tofu-rice', n: 'Crispy tofu and veg rice bowl', t: 'd', k: 'a', s: 1, m: 25,
      i: [['tofu', 130], ['ricepouch', 1], ['mixveg', 100], ['soy', 15], ['oil', 5]],
      st: ['Press the tofu with kitchen paper, cube it and toss with the soy sauce and oil.', 'Cook in the air fryer at 200°C for 15 minutes, shaking halfway, until crisp.', 'Microwave the frozen veg for 3 minutes and heat the rice pouch following the packet. Serve the tofu on top.'] },
    { id: 'air-fryer-veg-chickpea-roast', n: 'Air fryer roast veg and chickpeas', t: 'd', k: 'a', s: 0, m: 25,
      i: [['chickpeas', 150], ['sweetpot', 200], ['pepper', 0.5], ['oil', 8], ['paprika', 3]],
      st: ['Cut the sweet potato and pepper into small chunks. Drain and dry the chickpeas.', 'Toss everything with the oil and paprika and cook in the air fryer at 200°C for 15 to 18 minutes, shaking every 5 minutes, until the edges are crisp.'] },
    { id: 'air-fryer-fishfinger-chips', n: 'Fish fingers, chips and beans', t: 'd', k: 'a', s: 0, m: 30,
      i: [['fishfing', 4], ['potato', 250], ['beans', 150], ['oil', 8]],
      st: ['Cut the potato into chips and toss with the oil. Cook in the air fryer at 200°C for 12 minutes.', 'Add the fish fingers and cook for another 8 to 10 minutes, shaking halfway, or follow the box.', 'Warm the beans in the microwave for 2 minutes and serve.'] },
    { id: 'air-fryer-chicken-fajitas', n: 'Chicken fajita wraps', t: 'd', k: 'a', s: 1, m: 25,
      i: [['chicken', 120], ['wraps', 2], ['pepper', 0.5], ['onion', 0.5], ['paprika', 3], ['oil', 5], ['yoghurt', 30]],
      st: ['Slice the chicken, pepper and onion into strips and toss with the oil and paprika.', 'Cook in the air fryer at 190°C for 12 to 15 minutes, shaking halfway, until the chicken is cooked through with no pink inside.', 'Fill the wraps with the chicken and veg and add a spoonful of yoghurt.'] }
  ];

  var RMAP = {};
  RECIPES.forEach(function (r) { RMAP[r.id] = r; });

  var KIT_RANK = { m: 0, h: 1, o: 2 };
  var KIT_FACT = { m: 'Microwave', h: 'Hob', o: 'Oven', a: 'Air fryer' };
  var AVOID_FLAG = { gluten: 'g', dairy: 'd', egg: 'e', nuts: 'n', fish: 'fi' };

  /* ======================================================================
     HELPERS
     ====================================================================== */

  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');

  // The week layout rules are also set here, not just in style.css, so the three-meal rows
  // still line up if a browser is holding on to an older copy of the stylesheet.
  (function () {
    var st = document.createElement('style');
    st.id = 'week-layout';
    st.textContent =
      '.day{display:grid;grid-template-columns:96px 1fr;gap:.75rem;align-items:start}' +
      '.meal-pair{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}' +
      '@media (max-width:760px){.day{grid-template-columns:1fr;gap:.5rem}.meal-pair{gap:.5rem}}';
    document.head.appendChild(st);
  })();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function gbp(p) {
    var sign = p < 0 ? '-' : '';
    return sign + '£' + (Math.abs(p) / 100).toFixed(2);
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function isoDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayDate(start, i) {
    var p = start.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2] + i);
  }
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function fmtQty(g, q) {
    if (g.u === 'g') return q >= 1000 ? (q / 1000).toFixed(1).replace(/\.0$/, '') + ' kg' : Math.max(5, Math.round(q / 5) * 5) + ' g';
    if (g.u === 'ml') return q >= 1000 ? (q / 1000).toFixed(1).replace(/\.0$/, '') + ' L' : Math.max(5, Math.round(q / 5) * 5) + ' ml';
    return String(Math.ceil(q - 1e-9));
  }

  /* ======================================================================
     STATE
     ====================================================================== */

  function defaultPrefs() {
    return {
      budget: 3000, store: 'aldi', diet: 'any', halal: false,
      avoid: { gluten: false, dairy: false, egg: false, nuts: false, fish: false },
      kit: 'h', airfryer: false, skill: 1, owned: [], takeaway: 800, cafeBreakfast: 400
    };
  }
  function defaults() {
    return { onboarded: false, prefs: defaultPrefs(), plan: null, prevCost: null,
      stats: { cooked: 0, saved: 0, streak: 0, last: null } };
  }
  function load() {
    var s = defaults();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        s.onboarded = !!saved.onboarded;
        s.prefs = Object.assign(defaultPrefs(), saved.prefs || {});
        s.prefs.avoid = Object.assign(defaultPrefs().avoid, (saved.prefs || {}).avoid || {});
        s.plan = saved.plan || null;
        s.prevCost = saved.prevCost == null ? null : saved.prevCost;
        s.stats = Object.assign(s.stats, saved.stats || {});
      }
    } catch (e) { /* storage unavailable: run without saving */ }
    if (s.plan) {
      var ok = s.plan.days && s.plan.days.length === 7 && s.plan.days.every(function (d) {
        return d.meals.length === 3 && d.meals.every(function (m) { return RMAP[m.id]; });
      });
      if (!ok) s.plan = null;
    }
    return s;
  }
  var state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  var ui = { tab: 'plan', step: 0, editing: false, draft: null, rescue: {}, error: '' };

  /* ======================================================================
     RECIPE FILTERING, COSTS, PLAN GENERATION
     ====================================================================== */

  function flagsOf(r) {
    var f = {};
    r.i.forEach(function (x) { (ING[x[0]].f || []).forEach(function (k) { f[k] = true; }); });
    return f;
  }
  // Air fryer recipes need an air fryer. Oven recipes marked with an af line also work in one.
  function kitOk(r, p) {
    if (r.k === 'a') return !!p.airfryer;
    if (KIT_RANK[r.k] <= KIT_RANK[p.kit]) return true;
    return !!(p.airfryer && r.k === 'o' && r.af);
  }
  function kitLabel(r) {
    if (r.k === 'o' && r.af) return 'Oven or air fryer';
    return KIT_FACT[r.k];
  }
  function howTo(r) {
    return '<details><summary>How to make it</summary><ol>' + r.st.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
      (r.k === 'o' && r.af ? '<p style="margin-top:.5rem;font-size:.92rem"><strong>In an air fryer:</strong> ' + esc(r.af) + '</p>' : '') + '</details>';
  }

  function allowed(r, p) {
    if (!kitOk(r, p)) return false;
    if (r.s > p.skill) return false;
    var f = flagsOf(r);
    if (p.diet !== 'any' && (f.m || f.pk || f.fi)) return false;
    if (p.diet === 'vegan' && (f.d || f.e)) return false;
    if (p.halal && f.pk) return false;
    for (var k in AVOID_FLAG) { if (p.avoid[k] && f[AVOID_FLAG[k]]) return false; }
    return true;
  }
  var SLOTS = ['br', 'l', 'd'];
  var SLOT_LABEL = ['Breakfast', 'Lunch', 'Dinner'];
  var MEALS_PER_WEEK = 21;

  function pool(slot, p) {
    return RECIPES.filter(function (r) {
      var fits = slot === 'br' ? (r.t === 'br' || r.bf) : (r.t === slot || r.t === 'b');
      return fits && allowed(r, p);
    });
  }

  function tally(plan) {
    var t = {};
    plan.days.forEach(function (d) {
      d.meals.forEach(function (m) {
        RMAP[m.id].i.forEach(function (x) { t[x[0]] = (t[x[0]] || 0) + x[1]; });
      });
    });
    return t;
  }
  function shoppingLines(plan, owned, storeId) {
    var mult = STORES[storeId].m, t = tally(plan);
    return Object.keys(t).filter(function (id) { return owned.indexOf(id) === -1; }).map(function (id) {
      var g = ING[id], packs = Math.ceil(t[id] / g.p - 1e-9);
      return { id: id, need: t[id], packs: packs, cost: Math.round(packs * g.c * mult), g: g };
    });
  }
  function planCost(plan, owned, storeId) {
    return shoppingLines(plan, owned, storeId).reduce(function (a, l) { return a + l.cost; }, 0);
  }
  // Rough share of the weekly shop this one meal uses (for showing on meal cards).
  function recipeCost(r, p) {
    var mult = STORES[p.store].m;
    return Math.round(r.i.reduce(function (a, x) {
      if (p.owned.indexOf(x[0]) !== -1) return a;
      var g = ING[x[0]];
      return a + (x[1] / g.p) * g.c * mult;
    }, 0));
  }

  function pickSet(list, n) {
    var out = [];
    while (out.length < n) {
      shuffle(list.slice()).forEach(function (r) { if (out.length < n) out.push(r.id); });
    }
    return out;
  }

  // Swap entries inside list B so that no day has the same recipe in A and B.
  function untangle(A, B) {
    for (var i = 0; i < 7; i++) {
      if (A[i] !== B[i]) continue;
      for (var k = 1; k < 7; k++) {
        var j = (i + k) % 7;
        if (B[j] !== A[i] && A[j] !== B[i]) { var t = B[i]; B[i] = B[j]; B[j] = t; break; }
      }
    }
  }

  // If the best plan is still over budget, keep making the single swap that saves the most money.
  function trim(plan, p, pools) {
    for (var iter = 0; iter < 25; iter++) {
      var cur = planCost(plan, p.owned, p.store);
      if (cur <= p.budget) break;
      var counts = {}, best = null;
      plan.days.forEach(function (d) { d.meals.forEach(function (m) { counts[m.id] = (counts[m.id] || 0) + 1; }); });
      plan.days.forEach(function (d) {
        d.meals.forEach(function (m, mi) {
          var cap = Math.max(3, Math.ceil(7 / pools[mi].length) + 1);
          pools[mi].forEach(function (r) {
            if (r.id === m.id || (counts[r.id] || 0) >= cap) return;
            if (d.meals.some(function (o, oi) { return oi !== mi && o.id === r.id; })) return;
            var old = m.id; m.id = r.id;
            var c = planCost(plan, p.owned, p.store);
            m.id = old;
            if (c < cur && (!best || c < best.c)) best = { m: m, id: r.id, c: c };
          });
        });
      });
      if (!best) break;
      best.m.id = best.id;
    }
  }

  function generatePlan(p) {
    var pools = SLOTS.map(function (s) { return pool(s, p); });
    if (pools.some(function (x) { return !x.length; })) return null;
    var candidates = [], tries = 300;
    for (var n = 0; n < tries; n++) {
      var B = pickSet(pools[0], 7), L = pickSet(pools[1], 7), D = pickSet(pools[2], 7);
      untangle(B, L); untangle(L, D); untangle(B, D);
      var plan = { days: B.map(function (id, k) { return { meals: [{ id: id }, { id: L[k] }, { id: D[k] }] }; }) };
      candidates.push({ plan: plan, cost: planCost(plan, p.owned, p.store) });
    }
    candidates.sort(function (a, b) { return a.cost - b.cost; });
    var within = candidates.filter(function (c) { return c.cost <= p.budget; });
    var chosen;
    if (within.length) {
      // Random from the cheaper half of plans that fit, so "new plan" gives variety without overspending.
      var half = within.slice(0, Math.max(1, Math.ceil(within.length / 2)));
      chosen = half[Math.floor(Math.random() * half.length)];
    } else {
      chosen = candidates[0];
      trim(chosen.plan, p, pools);
    }
    chosen.plan.id = String(Date.now());
    chosen.plan.start = isoDate(new Date());
    chosen.plan.bought = {};
    chosen.plan.limited = Math.min(pools[0].length, pools[1].length, pools[2].length) < 5;
    return chosen.plan;
  }

  /* ======================================================================
     ACTIONS
     ====================================================================== */

  function newPlan(keepPrev) {
    var p = state.prefs;
    var old = state.plan;
    var plan = generatePlan(p);
    if (!plan) { state.plan = null; save(); render(); return; }
    if (keepPrev && old) state.prevCost = planCost(old, p.owned, p.store);
    state.plan = plan;
    save();
  }

  function swapMeal(di, mi) {
    var p = state.prefs, plan = state.plan;
    var meal = plan.days[di].meals[mi];
    var list = pool(SLOTS[mi], p).filter(function (r) {
      return r.id !== meal.id && !plan.days[di].meals.some(function (o, oi) { return oi !== mi && o.id === r.id; });
    });
    if (!list.length) { toast('No other meals fit your settings for this slot.'); return; }
    var used = {};
    plan.days.forEach(function (d) { d.meals.forEach(function (m) { used[m.id] = true; }); });
    var fresh = list.filter(function (r) { return !used[r.id]; });
    var choices = fresh.length ? fresh : list;
    var before = planCost(plan, p.owned, p.store);
    var pick = choices[Math.floor(Math.random() * choices.length)];
    var oldName = RMAP[meal.id].n;
    meal.id = pick.id;
    meal.done = false;
    meal.saved = 0;
    var diff = planCost(plan, p.owned, p.store) - before;
    save();
    render();
    toast('Swapped ' + oldName + ' for ' + pick.n + ' (' + (diff === 0 ? 'same cost' : (diff < 0 ? gbp(-diff) + ' cheaper' : gbp(diff) + ' dearer')) + ')');
  }

  function toggleCooked(di, mi) {
    var p = state.prefs, plan = state.plan, st = state.stats;
    var meal = plan.days[di].meals[mi];
    if (meal.done) {
      meal.done = false;
      st.cooked = Math.max(0, st.cooked - 1);
      st.saved = st.saved - (meal.saved || 0);
      meal.saved = 0;
    } else {
      var perMeal = Math.round(planCost(plan, p.owned, p.store) / MEALS_PER_WEEK);
      meal.done = true;
      meal.saved = Math.max(0, (mi === 0 ? p.cafeBreakfast : p.takeaway) - perMeal);
      st.cooked += 1;
      st.saved += meal.saved;
      var today = isoDate(new Date());
      if (st.last !== today) {
        var y = new Date(); y.setDate(y.getDate() - 1);
        st.streak = st.last === isoDate(y) ? st.streak + 1 : 1;
        st.last = today;
      }
    }
    save();
    render();
  }

  /* ======================================================================
     RENDER: ONBOARDING
     ====================================================================== */

  var STEP_COUNT = 4;

  function pill(type, name, value, label, checked) {
    return '<label class="pill"><input type="' + type + '" name="' + name + '" value="' + esc(value) + '"' +
      (checked ? ' checked' : '') + '><span>' + esc(label) + '</span></label>';
  }

  function stepBudget(d) {
    var stores = Object.keys(STORES).map(function (id) {
      return pill('radio', 'store', id, STORES[id].name, d.store === id);
    }).join('');
    return '<fieldset><legend>Your weekly food budget</legend>' +
      '<p class="hint">Just groceries, not eating out. Most students land somewhere between £20 and £40.</p>' +
      '<div class="money"><span class="money-sign">£</span>' +
      '<input id="budget" name="budget" type="number" inputmode="decimal" min="5" max="200" step="0.5" value="' + (d.budget / 100) + '" aria-label="Weekly food budget in pounds">' +
      '<span class="money-unit">a week</span></div>' +
      '<p class="error" id="step-error" role="alert"></p></fieldset>' +
      '<fieldset><legend>Where do you shop?</legend>' +
      '<p class="hint">Your nearest supermarket. Prices are estimates, so check them in store.</p>' +
      '<div class="pills">' + stores + '</div></fieldset>';
  }

  function stepDiet(d) {
    var diets = [['any', 'I eat everything'], ['vegetarian', 'Vegetarian'], ['vegan', 'Vegan']];
    var avoid = [['gluten', 'Gluten'], ['dairy', 'Dairy'], ['egg', 'Eggs'], ['nuts', 'Nuts'], ['fish', 'Fish']];
    return '<fieldset><legend>How do you eat?</legend><div class="pills">' +
      diets.map(function (x) { return pill('radio', 'diet', x[0], x[1], d.diet === x[0]); }).join('') +
      pill('checkbox', 'halal', 'halal', 'Halal (no pork)', d.halal) +
      '</div><p class="hint" style="margin-top:.6rem">For halal, buy meat that is halal certified. We only leave out pork recipes.</p></fieldset>' +
      '<fieldset><legend>Anything you need to avoid?</legend><div class="pills">' +
      avoid.map(function (x) { return pill('checkbox', 'avoid', x[0], x[1], d.avoid[x[0]]); }).join('') +
      '</div><p class="fine">We filter recipes by their ingredients. Always check packaging, especially for allergies.</p></fieldset>';
  }

  function stepKitchen(d) {
    var kits = [['m', 'Microwave only'], ['h', 'Microwave and hob'], ['o', 'Hob and oven']];
    var skills = [[0, 'None yet'], [1, 'Basic'], [2, 'Confident']];
    return '<fieldset><legend>What can you cook with?</legend>' +
      '<p class="hint">Think of your halls kitchen or your flat.</p><div class="pills">' +
      kits.map(function (x) { return pill('radio', 'kit', x[0], x[1], d.kit === x[0]); }).join('') +
      '</div>' +
      '<p class="hint" style="margin-top:1rem">Got an air fryer as well? Tick it and you get crispy, roast-style meals, even without an oven.</p>' +
      '<div class="pills">' + pill('checkbox', 'airfryer', 'airfryer', 'I have an air fryer', d.airfryer) + '</div></fieldset>' +
      '<fieldset><legend>How well do you cook?</legend>' +
      '<p class="hint">None yet gets you very simple recipes. Confident includes things like cottage pie.</p><div class="pills">' +
      skills.map(function (x) { return pill('radio', 'skill', x[0], x[1], d.skill === x[0]); }).join('') +
      '</div></fieldset>';
  }

  function stepCupboard(d) {
    var groups = AISLES.map(function (a) {
      var chips = Object.keys(ING).filter(function (id) { return ING[id].a === a[0]; }).map(function (id) {
        return '<button type="button" class="chip-btn" data-action="own" data-id="' + id + '" aria-pressed="' + (d.owned.indexOf(id) !== -1) + '">' + esc(ING[id].n) + '</button>';
      }).join(' ');
      return '<div class="pantry-group"><h3>' + a[1] + '</h3><div class="pills">' + chips + '</div></div>';
    }).join('');
    return '<fieldset><legend>What do you already have?</legend>' +
      '<p class="hint">Tap anything you already own with enough to use this week. We will leave it off your shopping list. Skip this if your cupboards are empty.</p>' +
      groups + '</fieldset>';
  }

  function renderOnboarding() {
    var d = ui.draft, s = ui.step;
    var body = [stepBudget, stepDiet, stepKitchen, stepCupboard][s](d);
    var bars = '';
    for (var i = 0; i < STEP_COUNT; i++) bars += '<span class="' + (i <= s ? 'is-on' : '') + '"></span>';
    var first = !state.onboarded;
    app.innerHTML =
      '<div class="onboard">' +
      '<div class="site-head"><span class="brand">Student Meal Planner</span>' +
      (!first ? '<button class="btn btn-quiet" data-action="cancel-edit">Cancel</button>' : '') + '</div>' +
      (s === 0 ? '<h1>A week of meals that fits your budget.</h1><p class="lede">Answer four quick questions and get seven days of breakfasts, lunches and dinners, plus one shopping list.</p>' : '') +
      '<div class="stepper" aria-hidden="true">' + bars + '</div>' +
      '<p class="step-count">Step ' + (s + 1) + ' of ' + STEP_COUNT + '</p>' +
      '<form id="onboard-form" novalidate>' + body + '</form>' +
      '<div class="nav-row">' +
      (s > 0 ? '<button class="btn" data-action="back">Back</button>' : '<span></span>') +
      (s < STEP_COUNT - 1
        ? '<button class="btn btn-primary" data-action="next">Next</button>'
        : '<button class="btn btn-primary" data-action="finish">Make my plan</button>') +
      '</div></div>';
    var h = app.querySelector('h1, legend');
    if (ui.focusStep && h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    ui.focusStep = false;
  }

  /* ======================================================================
     RENDER: MAIN APP
     ====================================================================== */

  function header() {
    var tabs = [['plan', 'This week'], ['list', 'Shopping list'], ['rescue', 'Use it up'], ['savings', 'Savings']];
    return '<header class="site-head"><span class="brand">Student Meal Planner</span>' +
      '<button class="btn btn-quiet" data-action="settings">Settings</button></header>' +
      '<div class="tabs" role="tablist" aria-label="Sections">' +
      tabs.map(function (t) {
        return '<button class="tab" role="tab" id="tab-' + t[0] + '" aria-selected="' + (ui.tab === t[0]) + '" aria-controls="panel" data-action="tab" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';
  }

  function noPlanPanel() {
    return '<div class="empty"><h2 style="font-size:1.3rem;margin-bottom:.5rem">No recipes match those settings</h2>' +
      '<p>Your diet, allergies, kitchen and cooking level together rule out every recipe for breakfast, lunch or dinner. Try a bigger kitchen, a higher cooking level, or fewer exclusions.</p>' +
      '<p style="margin-top:1rem"><button class="btn btn-primary" data-action="settings">Change settings</button></p></div>';
  }

  function planPanel() {
    var p = state.prefs, plan = state.plan;
    if (!plan) return noPlanPanel();
    var cost = planCost(plan, p.owned, p.store);
    var over = cost > p.budget;
    var pct = Math.min(100, Math.round(cost / p.budget * 100));
    var storeName = STORES[p.store].name;

    var costs = Object.keys(STORES).map(function (id) { return { id: id, c: planCost(plan, p.owned, id) }; });
    var cheapest = costs.slice().sort(function (a, b) { return a.c - b.c; })[0];

    var notes = '';
    if (plan.limited) notes += '<p class="note is-warn">Only a few recipes fit your settings, so some meals repeat.</p>';
    if (state.prevCost != null) {
      var diff = cost - state.prevCost;
      if (diff < 0) notes += '<p class="note">This week\'s plan costs ' + gbp(-diff) + ' less than last week\'s.</p>';
      else if (diff > 0) notes += '<p class="note is-warn">This week\'s plan costs ' + gbp(diff) + ' more than last week\'s.</p>';
      else notes += '<p class="note">This week\'s plan costs the same as last week\'s.</p>';
    }
    if (cheapest.id !== p.store && cost - cheapest.c >= 20) {
      notes += '<p class="note">Shopping at ' + STORES[cheapest.id].name + ' instead of ' + storeName + ' would save ' + gbp(cost - cheapest.c) + ' on this plan.</p>';
    } else if (cheapest.id === p.store) {
      notes += '<p class="note">' + storeName + ' is the cheapest of the five supermarkets for this plan.</p>';
    }

    var summary =
      '<section class="summary" aria-label="Plan cost">' +
      '<div class="sticker"><span class="sticker-amt">' + gbp(cost) + '</span><span class="sticker-sub">' + MEALS_PER_WEEK + ' meals at ' + esc(storeName) + '</span></div>' +
      '<div><div class="budget-bar' + (over ? ' is-over' : '') + '" role="img" aria-label="' + pct + ' percent of budget"><span style="width:' + pct + '%"></span></div>' +
      '<p class="budget-text' + (over ? ' is-over' : '') + '">' +
      (over ? gbp(cost - p.budget) + ' over your ' + gbp(p.budget) + ' budget. Try a new plan, another supermarket or a bigger cupboard check.' : gbp(p.budget - cost) + ' under your ' + gbp(p.budget) + ' budget') +
      '</p></div>' +
      (notes ? '<div class="notes">' + notes + '</div>' : '') +
      '<div class="actions"><button class="btn btn-primary" data-action="new-plan">Make a new plan</button>' +
      '<button class="btn" data-action="goto-list">See shopping list</button></div></section>';

    var stores = '<h2 class="section-title">The same plan at other supermarkets</h2><ul class="stores">' +
      costs.map(function (c) {
        return '<li><button class="store-btn" data-action="set-store" data-store="' + c.id + '" aria-pressed="' + (p.store === c.id) + '">' +
          '<span class="store-name">' + esc(STORES[c.id].name) + '</span><span class="store-price">' + gbp(c.c) + '</span>' +
          '<span class="store-tag">' + (c.id === cheapest.id ? 'Cheapest' : '+' + gbp(c.c - cheapest.c)) + '</span></button></li>';
      }).join('') + '</ul>';

    var todayIso = isoDate(new Date());
    var days = plan.days.map(function (d, di) {
      var dt = dayDate(plan.start, di);
      var isToday = isoDate(dt) === todayIso;
      return '<section class="day" aria-label="' + dt.toLocaleDateString('en-GB', { weekday: 'long' }) + '">' +
        '<h3 class="day-name">' + dt.toLocaleDateString('en-GB', { weekday: 'short' }) +
        '<span class="day-date">' + dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '</span>' +
        (isToday ? '<span class="day-today">Today</span>' : '') + '</h3>' +
        '<div class="meal-pair">' + d.meals.map(function (m, mi) { return mealCard(m, di, mi, p); }).join('') + '</div></section>';
    }).join('');

    return summary + stores + '<h2 class="section-title">Your week</h2><div class="week">' + days + '</div>';
  }

  function mealCard(meal, di, mi, p) {
    var r = RMAP[meal.id];
    return '<article class="meal' + (meal.done ? ' is-done' : '') + '">' +
      '<p class="meal-slot">' + SLOT_LABEL[mi] + '</p>' +
      '<h4>' + esc(r.n) + '</h4>' +
      '<div class="meal-facts"><span class="meal-cost">about ' + gbp(recipeCost(r, p)) + '</span><span>' + r.m + ' min</span><span>' + kitLabel(r) + '</span></div>' +
      '<div class="meal-actions">' +
      '<button class="chip-btn" data-action="cook" data-d="' + di + '" data-m="' + mi + '" aria-pressed="' + !!meal.done + '">' + (meal.done ? 'Cooked' : 'Mark as cooked') + '</button>' +
      '<button class="chip-btn" data-action="swap" data-d="' + di + '" data-m="' + mi + '" aria-label="Swap ' + esc(r.n) + ' for another meal">Swap</button></div>' +
      howTo(r) +
      '</article>';
  }

  function listPanel() {
    var p = state.prefs, plan = state.plan;
    if (!plan) return noPlanPanel();
    var lines = shoppingLines(plan, p.owned, p.store);
    var total = lines.reduce(function (a, l) { return a + l.cost; }, 0);
    var groups = AISLES.map(function (a) {
      var ls = lines.filter(function (l) { return l.g.a === a[0]; }).sort(function (x, y) { return x.g.n.localeCompare(y.g.n); });
      if (!ls.length) return '';
      return '<section class="aisle"><h3>' + a[1] + '</h3><ul class="lines">' + ls.map(function (l) {
        var got = !!plan.bought[l.id];
        var need = l.g.u === 'each' ? 'need ' + fmtQty(l.g, l.need) : 'need about ' + fmtQty(l.g, l.need);
        return '<li class="line' + (got ? ' is-got' : '') + '"><label>' +
          '<input type="checkbox" data-action="bought" data-id="' + l.id + '"' + (got ? ' checked' : '') + '>' +
          '<span><span class="line-name">' + esc(l.g.n) + '</span><span class="line-need">' + l.packs + ' × ' + esc(l.g.l) + ', ' + need + '</span></span></label>' +
          '<span class="leader" aria-hidden="true"></span><span class="line-price">' + gbp(l.cost) + '</span></li>';
      }).join('') + '</ul></section>';
    }).join('');
    var have = p.owned.filter(function (id) { return tally(plan)[id]; }).map(function (id) { return ING[id].n; });
    return '<div class="receipt-wrap"><div class="receipt">' +
      '<h2>Shopping list</h2><p class="receipt-sub">' + esc(STORES[p.store].name) + ', for ' + plan.days.length + ' days of breakfasts, lunches and dinners. Prices are estimates.</p>' +
      groups +
      '<div class="receipt-total"><span>Total</span><span class="sticker"><span class="sticker-amt">' + gbp(total) + '</span></span></div>' +
      (have.length ? '<p class="have">Not on the list because you already have: ' + esc(have.join(', ')) + '.</p>' : '') +
      '</div></div>' +
      '<div class="list-actions"><button class="btn" data-action="copy">Copy list</button><button class="btn" data-action="print">Print list</button></div>';
  }

  function rescueResults() {
    var p = state.prefs, sel = ui.rescue;
    if (!Object.keys(sel).length) return '<div class="empty">Tap what is left in your fridge, freezer and cupboards and we will find meals that use it up.</div>';
    var res = RECIPES.filter(function (r) { return allowed(r, p); }).map(function (r) {
      var ids = r.i.map(function (x) { return x[0]; });
      return {
        r: r,
        used: ids.filter(function (id) { return sel[id]; }),
        missing: ids.filter(function (id) { return !sel[id] && p.owned.indexOf(id) === -1 && !FRIDGE_SKIP[id]; })
      };
    }).filter(function (x) { return x.used.length; }).sort(function (a, b) {
      return b.used.length - a.used.length || a.missing.length - b.missing.length;
    }).slice(0, 6);
    if (!res.length) return '<div class="empty">Nothing in your settings uses those. Try picking something else.</div>';
    return '<div class="results">' + res.map(function (x) {
      return '<article class="result"><h4>' + esc(x.r.n) + '</h4>' +
        '<p class="uses"><strong>Uses up:</strong> ' + esc(x.used.map(function (id) { return ING[id].n; }).join(', ')) + '</p>' +
        '<p class="needs">' + (x.missing.length ? 'You would still need: ' + esc(x.missing.map(function (id) { return ING[id].n; }).join(', ')) : 'You have everything it needs.') + '</p>' +
        howTo(x.r) + '</article>';
    }).join('') + '</div>';
  }

  function rescuePanel() {
    var groups = AISLES.map(function (a) {
      var ids = Object.keys(ING).filter(function (id) { return ING[id].a === a[0] && !FRIDGE_SKIP[id]; });
      if (!ids.length) return '';
      return '<div class="pantry-group"><h3>' + a[1] + '</h3><div class="pills">' + ids.map(function (id) {
        return '<button type="button" class="chip-btn" data-action="fridge" data-id="' + id + '" aria-pressed="' + !!ui.rescue[id] + '">' + esc(ING[id].n) + '</button>';
      }).join(' ') + '</div></div>';
    }).join('');
    return '<h2 class="section-title" style="margin-top:0">What needs using up?</h2>' +
      '<p class="hint">Pick what is left over. We only suggest meals that fit your diet and kitchen.</p>' + groups +
      '<div id="rescue-results" aria-live="polite">' + rescueResults() + '</div>';
  }

  function savingsPanel() {
    var p = state.prefs, st = state.stats, plan = state.plan;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var streak = (st.last === isoDate(new Date()) || st.last === isoDate(y)) ? st.streak : 0;
    var doneThisWeek = plan ? plan.days.reduce(function (a, d) { return a + d.meals.filter(function (m) { return m.done; }).length; }, 0) : 0;
    return '<h2 class="section-title" style="margin-top:0">Your savings</h2>' +
      '<div class="stats">' +
      '<div class="stat is-money"><div class="stat-num">' + gbp(st.saved) + '</div><div class="stat-label">saved compared with takeaway</div></div>' +
      '<div class="stat"><div class="stat-num">' + st.cooked + '</div><div class="stat-label">meals cooked in total</div></div>' +
      '<div class="stat"><div class="stat-num">' + streak + '</div><div class="stat-label">day cooking streak</div></div>' +
      '<div class="stat"><div class="stat-num">' + doneThisWeek + ' of ' + MEALS_PER_WEEK + '</div><div class="stat-label">meals cooked this week</div></div>' +
      '</div>' +
      '<div class="takeaway"><label for="takeaway">A takeaway lunch or dinner costs me about £</label>' +
      '<input id="takeaway" type="number" min="1" max="50" step="0.5" value="' + (p.takeaway / 100) + '"></div>' +
      '<div class="takeaway"><label for="cafe">A cafe or shop breakfast costs me about £</label>' +
      '<input id="cafe" type="number" min="1" max="30" step="0.5" value="' + (p.cafeBreakfast / 100) + '"></div>' +
      '<p class="fine">Each meal you mark as cooked saves what you would have paid out, minus what that meal costs from your shopping list.</p>' +
      '<aside class="plus"><h3>Coming later in Plus</h3><ul>' +
      '<li>Plan several weeks ahead</li><li>Split shopping lists with flatmates</li><li>Nutrition tracking</li><li>No ads</li></ul>' +
      '<p class="fine">These are not built yet.</p></aside>';
  }

  function renderApp() {
    var panels = { plan: planPanel, list: listPanel, rescue: rescuePanel, savings: savingsPanel };
    app.innerHTML = header() + '<main id="panel" role="tabpanel" aria-labelledby="tab-' + ui.tab + '">' + panels[ui.tab]() + '</main>';
  }

  function render() {
    var y = window.scrollY;
    if (!state.onboarded || ui.editing) renderOnboarding(); else renderApp();
    if (window.scrollTo) window.scrollTo(0, y);
  }

  /* ======================================================================
     EVENTS
     ====================================================================== */

  function readStep() {
    var d = ui.draft, f = document.getElementById('onboard-form');
    if (!f) return true;
    if (ui.step === 0) {
      var v = parseFloat(f.elements.budget.value);
      if (!(v >= 5 && v <= 200)) {
        document.getElementById('step-error').textContent = 'Enter a weekly budget between £5 and £200.';
        return false;
      }
      d.budget = Math.round(v * 100);
      var s = f.querySelector('input[name="store"]:checked');
      if (s) d.store = s.value;
    } else if (ui.step === 1) {
      var diet = f.querySelector('input[name="diet"]:checked');
      if (diet) d.diet = diet.value;
      d.halal = !!f.querySelector('input[name="halal"]:checked');
      Object.keys(d.avoid).forEach(function (k) {
        d.avoid[k] = !!f.querySelector('input[name="avoid"][value="' + k + '"]:checked');
      });
    } else if (ui.step === 2) {
      var kit = f.querySelector('input[name="kit"]:checked');
      if (kit) d.kit = kit.value;
      d.airfryer = !!f.querySelector('input[name="airfryer"]:checked');
      var sk = f.querySelector('input[name="skill"]:checked');
      if (sk) d.skill = parseInt(sk.value, 10);
    }
    return true;
  }

  function copyList() {
    var p = state.prefs, plan = state.plan;
    var lines = shoppingLines(plan, p.owned, p.store);
    var text = 'Shopping list (' + STORES[p.store].name + ')\n\n';
    AISLES.forEach(function (a) {
      var ls = lines.filter(function (l) { return l.g.a === a[0]; });
      if (!ls.length) return;
      text += a[1] + '\n';
      ls.forEach(function (l) { text += '- ' + l.g.n + ': ' + l.packs + ' x ' + l.g.l + ' (' + gbp(l.cost) + ')\n'; });
      text += '\n';
    });
    text += 'Total: ' + gbp(lines.reduce(function (a, l) { return a + l.cost; }, 0));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Shopping list copied'); }, function () { toast('Could not copy. Try Print list instead.'); });
    } else { toast('Copy is not available here. Try Print list instead.'); }
  }

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action');

    if (a === 'next') {
      if (readStep()) { ui.step++; ui.focusStep = true; render(); window.scrollTo(0, 0); }
    } else if (a === 'back') {
      readStep(); ui.step--; ui.focusStep = true; render(); window.scrollTo(0, 0);
    } else if (a === 'finish') {
      state.prefs = ui.draft;
      state.onboarded = true;
      ui.editing = false; ui.tab = 'plan';
      newPlan(false);
      render(); window.scrollTo(0, 0);
    } else if (a === 'own') {
      var id = el.getAttribute('data-id'), i = ui.draft.owned.indexOf(id);
      if (i === -1) ui.draft.owned.push(id); else ui.draft.owned.splice(i, 1);
      el.setAttribute('aria-pressed', String(i === -1));
    } else if (a === 'settings') {
      ui.draft = JSON.parse(JSON.stringify(state.prefs));
      ui.editing = true; ui.step = 0; render(); window.scrollTo(0, 0);
    } else if (a === 'cancel-edit') {
      ui.editing = false; render();
    } else if (a === 'tab') {
      ui.tab = el.getAttribute('data-tab'); render();
    } else if (a === 'goto-list') {
      ui.tab = 'list'; render(); window.scrollTo(0, 0);
    } else if (a === 'new-plan') {
      newPlan(true); render(); toast('Here is a fresh plan');
    } else if (a === 'set-store') {
      state.prefs.store = el.getAttribute('data-store'); save(); render();
    } else if (a === 'swap') {
      swapMeal(+el.getAttribute('data-d'), +el.getAttribute('data-m'));
    } else if (a === 'cook') {
      toggleCooked(+el.getAttribute('data-d'), +el.getAttribute('data-m'));
    } else if (a === 'copy') {
      copyList();
    } else if (a === 'print') {
      window.print();
    } else if (a === 'fridge') {
      var fid = el.getAttribute('data-id');
      if (ui.rescue[fid]) delete ui.rescue[fid]; else ui.rescue[fid] = true;
      el.setAttribute('aria-pressed', String(!!ui.rescue[fid]));
      document.getElementById('rescue-results').innerHTML = rescueResults();
    }
  });

  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute('data-action') === 'bought') {
      var id = t.getAttribute('data-id');
      if (t.checked) state.plan.bought[id] = true; else delete state.plan.bought[id];
      t.closest('.line').classList.toggle('is-got', t.checked);
      save();
    } else if (t.id === 'cafe') {
      var cv = parseFloat(t.value);
      if (cv >= 1 && cv <= 30) { state.prefs.cafeBreakfast = Math.round(cv * 100); save(); toast('Breakfast price updated'); }
    } else if (t.id === 'takeaway') {
      var v = parseFloat(t.value);
      if (v >= 1 && v <= 50) { state.prefs.takeaway = Math.round(v * 100); save(); toast('Takeaway price updated'); }
    }
  });

  /* ======================================================================
     START
     ====================================================================== */

  if (!state.onboarded) ui.draft = defaultPrefs();
  if (state.onboarded && !state.plan) newPlan(false);
  render();

  // Exposed for quick testing in the browser console.
  window.__mealPlanner = { SLOTS: SLOTS, RECIPES: RECIPES, ING: ING, allowed: allowed, generatePlan: generatePlan, defaultPrefs: defaultPrefs, planCost: planCost, shoppingLines: shoppingLines, pool: pool };
})();
