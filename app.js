/* Student Meal Planner
   No build step, no backend. Everything is saved in your browser (localStorage).
   Prices are rough estimates: edit the numbers in INGREDIENTS and STORES below to tune them. */
(function () {
  'use strict';

  /* ======================================================================
     DATA
     ====================================================================== */

  var KEY = 'studentMealPlanner.v1';

  // m = price multiplier against our base prices. Estimates only.
  var STORES = {
    aldi:       { name: 'Aldi',        m: 0.86 },
    lidl:       { name: 'Lidl',        m: 0.88 },
    asda:       { name: 'Asda',        m: 0.95 },
    tesco:      { name: 'Tesco',       m: 1.00 },
    sainsburys: { name: "Sainsbury's", m: 1.03 }
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

  // n name, u unit (g / ml / each), p pack size, c pack price in pence, l pack label, a aisle,
  // f flags: m meat, pk pork, fi fish, d dairy, e egg, g gluten, n nuts
  var ING = {
    potato:    { n: 'Potatoes',            u: 'g',    p: 2000, c: 140, l: '2 kg bag',      a: 'veg' },
    sweetpot:  { n: 'Sweet potatoes',      u: 'g',    p: 1000, c: 150, l: '1 kg bag',      a: 'veg' },
    carrot:    { n: 'Carrots',             u: 'g',    p: 1000, c: 70,  l: '1 kg bag',      a: 'veg' },
    onion:     { n: 'Onions',              u: 'each', p: 5,    c: 90,  l: 'bag of 5',      a: 'veg' },
    garlic:    { n: 'Garlic',              u: 'each', p: 10,   c: 45,  l: 'bulb (10 cloves)', a: 'veg' },
    pepper:    { n: 'Peppers',             u: 'each', p: 3,    c: 130, l: 'pack of 3',     a: 'veg' },
    mushroom:  { n: 'Mushrooms',           u: 'g',    p: 300,  c: 100, l: '300 g punnet',  a: 'veg' },
    tomatoes:  { n: 'Tomatoes',            u: 'each', p: 6,    c: 110, l: 'pack of 6',     a: 'veg' },
    cucumber:  { n: 'Cucumber',            u: 'each', p: 1,    c: 70,  l: '1 cucumber',    a: 'veg' },

    chicken:   { n: 'Chicken breast',      u: 'g',    p: 650,  c: 400, l: '650 g pack',    a: 'meat', f: ['m'] },
    mince:     { n: 'Beef mince',          u: 'g',    p: 500,  c: 275, l: '500 g pack',    a: 'meat', f: ['m'] },
    sausages:  { n: 'Pork sausages',       u: 'each', p: 8,    c: 190, l: 'pack of 8',     a: 'meat', f: ['m', 'pk'] },

    eggs:      { n: 'Eggs',                u: 'each', p: 6,    c: 190, l: 'box of 6',      a: 'chilled', f: ['e'] },
    milk:      { n: 'Milk',                u: 'ml',   p: 1136, c: 105, l: '2 pint bottle', a: 'chilled', f: ['d'] },
    cheddar:   { n: 'Cheddar',             u: 'g',    p: 350,  c: 270, l: '350 g block',   a: 'chilled', f: ['d'] },
    yoghurt:   { n: 'Natural yoghurt',     u: 'g',    p: 500,  c: 90,  l: '500 g tub',     a: 'chilled', f: ['d'] },
    feta:      { n: 'Feta',                u: 'g',    p: 200,  c: 170, l: '200 g block',   a: 'chilled', f: ['d'] },
    tofu:      { n: 'Tofu',                u: 'g',    p: 396,  c: 150, l: '396 g block',   a: 'chilled' },
    hummus:    { n: 'Hummus',              u: 'g',    p: 200,  c: 85,  l: '200 g tub',     a: 'chilled' },

    bread:     { n: 'Sliced bread',        u: 'each', p: 16,   c: 85,  l: 'loaf (slices)', a: 'bread', f: ['g'] },
    wraps:     { n: 'Tortilla wraps',      u: 'each', p: 8,    c: 110, l: 'pack of 8',     a: 'bread', f: ['g'] },

    pasta:     { n: 'Pasta',               u: 'g',    p: 500,  c: 85,  l: '500 g bag',     a: 'cupboard', f: ['g'] },
    rice:      { n: 'Rice',                u: 'g',    p: 1000, c: 160, l: '1 kg bag',      a: 'cupboard' },
    ricepouch: { n: 'Microwave rice pouches', u: 'each', p: 2, c: 110, l: 'pack of 2',     a: 'cupboard' },
    noodles:   { n: 'Dried noodles',       u: 'g',    p: 300,  c: 95,  l: '300 g pack',    a: 'cupboard', f: ['g'] },
    tintom:    { n: 'Chopped tomatoes',    u: 'g',    p: 400,  c: 55,  l: '400 g tin',     a: 'cupboard' },
    beans:     { n: 'Baked beans',         u: 'g',    p: 400,  c: 50,  l: '400 g tin',     a: 'cupboard' },
    kidney:    { n: 'Kidney beans',        u: 'g',    p: 400,  c: 60,  l: '400 g tin',     a: 'cupboard' },
    chickpeas: { n: 'Chickpeas',           u: 'g',    p: 400,  c: 65,  l: '400 g tin',     a: 'cupboard' },
    lentils:   { n: 'Red lentils',         u: 'g',    p: 500,  c: 130, l: '500 g bag',     a: 'cupboard' },
    coconut:   { n: 'Coconut milk',        u: 'ml',   p: 400,  c: 95,  l: '400 ml tin',    a: 'cupboard' },
    sweetcorn: { n: 'Sweetcorn',           u: 'g',    p: 340,  c: 65,  l: '340 g tin',     a: 'cupboard' },
    tuna:      { n: 'Tuna',                u: 'g',    p: 145,  c: 110, l: '145 g tin',     a: 'cupboard', f: ['fi'] },
    pb:        { n: 'Peanut butter',       u: 'g',    p: 340,  c: 160, l: '340 g jar',     a: 'cupboard', f: ['n'] },

    peas:      { n: 'Frozen peas',         u: 'g',    p: 900,  c: 100, l: '900 g bag',     a: 'frozen' },
    mixveg:    { n: 'Frozen mixed veg',    u: 'g',    p: 1000, c: 130, l: '1 kg bag',      a: 'frozen' },
    spinach:   { n: 'Frozen spinach',      u: 'g',    p: 800,  c: 130, l: '800 g bag',     a: 'frozen' },
    fishfing:  { n: 'Fish fingers',        u: 'each', p: 10,   c: 215, l: 'box of 10',     a: 'frozen', f: ['fi', 'g'] },

    oil:       { n: 'Cooking oil',         u: 'ml',   p: 1000, c: 200, l: '1 L bottle',    a: 'sauce' },
    stock:     { n: 'Stock cubes',         u: 'each', p: 12,   c: 70,  l: 'box of 12',     a: 'sauce' },
    soy:       { n: 'Soy sauce',           u: 'ml',   p: 150,  c: 85,  l: '150 ml bottle', a: 'sauce', f: ['g'] },
    curry:     { n: 'Curry powder',        u: 'g',    p: 40,   c: 95,  l: '40 g jar',      a: 'sauce' },
    paprika:   { n: 'Paprika or chilli powder', u: 'g', p: 40,  c: 90,  l: '40 g jar',      a: 'sauce' },
    herbs:     { n: 'Mixed herbs',         u: 'g',    p: 20,   c: 85,  l: '20 g jar',      a: 'sauce' }
  };

  // Ingredients that make sense as "what's in my fridge" for the Use it up tab.
  var FRIDGE_SKIP = { oil: 1, stock: 1, soy: 1, curry: 1, paprika: 1, herbs: 1 };

  // t: l lunch, d dinner, b both. k: kit needed (m microwave, h hob, o oven). s: skill 0 none, 1 basic, 2 confident.
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
    { id: 'fishfinger-sandwich', n: 'Fish finger sandwich with peas', t: 'l', k: 'o', s: 0, m: 18,
      i: [['bread', 2], ['fishfing', 3], ['peas', 60]],
      st: ['Bake the fish fingers following the box (usually about 15 minutes at 200°C).', 'Microwave the peas for 2 minutes.', 'Make a sandwich with the fish fingers. Eat the peas on the side.'] },
    { id: 'veg-omelette-toast', n: 'Mushroom and cheese omelette with toast', t: 'b', k: 'h', s: 1, m: 12,
      i: [['eggs', 3], ['mushroom', 60], ['cheddar', 20], ['bread', 2], ['oil', 5]],
      st: ['Slice the mushrooms and fry them in the oil for 3 minutes. Beat the eggs.', 'Pour the eggs over the mushrooms. When it is nearly set, sprinkle on the cheese and fold it over.', 'Make the toast and serve.'] },
    { id: 'egg-cheese-wrap', n: 'Scrambled egg and cheese wrap', t: 'l', k: 'm', s: 0, m: 6,
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
    { id: 'sheet-pan-chicken', n: 'Sheet pan chicken and roast veg', t: 'd', k: 'o', s: 1, m: 45,
      i: [['chicken', 150], ['potato', 250], ['carrot', 100], ['pepper', 0.5], ['oil', 10], ['paprika', 3]],
      st: ['Heat the oven to 200°C. Chop the potato, carrot and pepper into chunky pieces.', 'Toss everything on a tray with the oil and paprika. Roast for 40 minutes, turning once, until the chicken is cooked through with no pink inside.'] },
    { id: 'baked-feta-pasta', n: 'Baked feta and tomato pasta', t: 'd', k: 'o', s: 1, m: 35,
      i: [['pasta', 100], ['feta', 60], ['tomatoes', 3], ['garlic', 1], ['oil', 10], ['herbs', 1]],
      st: ['Heat the oven to 200°C. Put the tomatoes, feta and crushed garlic in a dish with the oil and herbs. Bake for 25 minutes.', 'Boil the pasta following the packet and drain it.', 'Mash the feta and tomatoes together into a sauce and stir through the pasta.'] },
    { id: 'sausage-traybake', n: 'Sausage and veg traybake', t: 'd', k: 'o', s: 0, m: 40,
      i: [['sausages', 3], ['potato', 200], ['pepper', 0.5], ['onion', 0.5], ['oil', 10], ['herbs', 2]],
      st: ['Heat the oven to 200°C. Chop the potato, pepper and onion into chunks.', 'Put everything on a tray with the sausages, oil and herbs. Roast for 35 to 40 minutes, turning once, until the sausages are cooked through.'] },
    { id: 'cottage-pie', n: 'Cottage pie', t: 'd', k: 'o', s: 2, m: 60,
      i: [['mince', 120], ['potato', 300], ['carrot', 80], ['onion', 0.5], ['tintom', 150], ['stock', 0.5], ['milk', 30], ['oil', 5]],
      st: ['Peel and boil the potatoes for 15 minutes. Heat the oven to 200°C.', 'Fry the chopped onion and carrot in the oil, add the mince and brown it. Add the tomatoes and stock cube and simmer for 15 minutes.', 'Mash the potatoes with the milk. Put the mince in a dish, cover with the mash and bake for 20 minutes until golden.'] }
  ];

  var RMAP = {};
  RECIPES.forEach(function (r) { RMAP[r.id] = r; });

  var KIT_RANK = { m: 0, h: 1, o: 2 };
  var KIT_FACT = { m: 'Microwave', h: 'Hob', o: 'Oven' };
  var AVOID_FLAG = { gluten: 'g', dairy: 'd', egg: 'e', nuts: 'n', fish: 'fi' };

  /* ======================================================================
     HELPERS
     ====================================================================== */

  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');

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
      kit: 'h', skill: 1, owned: [], takeaway: 800
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
        return d.meals.length === 2 && d.meals.every(function (m) { return RMAP[m.id]; });
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
  function allowed(r, p) {
    if (KIT_RANK[r.k] > KIT_RANK[p.kit]) return false;
    if (r.s > p.skill) return false;
    var f = flagsOf(r);
    if (p.diet !== 'any' && (f.m || f.pk || f.fi)) return false;
    if (p.diet === 'vegan' && (f.d || f.e)) return false;
    if (p.halal && f.pk) return false;
    for (var k in AVOID_FLAG) { if (p.avoid[k] && f[AVOID_FLAG[k]]) return false; }
    return true;
  }
  function pool(slot, p) {
    return RECIPES.filter(function (r) { return (r.t === slot || r.t === 'b') && allowed(r, p); });
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

  function generatePlan(p) {
    var lp = pool('l', p), dp = pool('d', p);
    if (!lp.length || !dp.length) return null;
    var candidates = [], tries = 250;
    for (var n = 0; n < tries; n++) {
      var L = pickSet(lp, 7), D = pickSet(dp, 7);
      for (var i = 0; i < 7; i++) {
        if (L[i] === D[i] && dp.length > 1) { var j = (i + 1) % 7; var tmp = D[i]; D[i] = D[j]; D[j] = tmp; }
      }
      var plan = { days: L.map(function (id, k) { return { meals: [{ id: id }, { id: D[k] }] }; }) };
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
    }
    chosen.plan.id = String(Date.now());
    chosen.plan.start = isoDate(new Date());
    chosen.plan.bought = {};
    chosen.plan.limited = Math.min(lp.length, dp.length) < 5;
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
    var list = pool(mi === 0 ? 'l' : 'd', p).filter(function (r) { return r.id !== meal.id; });
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
      var perMeal = Math.round(planCost(plan, p.owned, p.store) / 14);
      meal.done = true;
      meal.saved = Math.max(0, p.takeaway - perMeal);
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
      '</div></fieldset>' +
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
      (s === 0 ? '<h1>A week of meals that fits your budget.</h1><p class="lede">Answer four quick questions and get seven days of lunches and dinners, plus one shopping list.</p>' : '') +
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
      '<p>Your diet, allergies, kitchen and cooking level together rule out every recipe for lunch or dinner. Try a bigger kitchen, a higher cooking level, or fewer exclusions.</p>' +
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
      '<div class="sticker"><span class="sticker-amt">' + gbp(cost) + '</span><span class="sticker-sub">14 meals at ' + esc(storeName) + '</span></div>' +
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
      '<p class="meal-slot">' + (mi === 0 ? 'Lunch' : 'Dinner') + '</p>' +
      '<h4>' + esc(r.n) + '</h4>' +
      '<div class="meal-facts"><span class="meal-cost">about ' + gbp(recipeCost(r, p)) + '</span><span>' + r.m + ' min</span><span>' + KIT_FACT[r.k] + '</span></div>' +
      '<div class="meal-actions">' +
      '<button class="chip-btn" data-action="cook" data-d="' + di + '" data-m="' + mi + '" aria-pressed="' + !!meal.done + '">' + (meal.done ? 'Cooked' : 'Mark as cooked') + '</button>' +
      '<button class="chip-btn" data-action="swap" data-d="' + di + '" data-m="' + mi + '" aria-label="Swap ' + esc(r.n) + ' for another meal">Swap</button></div>' +
      '<details><summary>How to make it</summary><ol>' + r.st.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></details>' +
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
      '<h2>Shopping list</h2><p class="receipt-sub">' + esc(STORES[p.store].name) + ', for ' + plan.days.length + ' days of lunches and dinners. Prices are estimates.</p>' +
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
        '<details><summary>How to make it</summary><ol>' + x.r.st.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></details></article>';
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
      '<div class="stat"><div class="stat-num">' + doneThisWeek + ' of 14</div><div class="stat-label">meals cooked this week</div></div>' +
      '</div>' +
      '<div class="takeaway"><label for="takeaway">A takeaway meal costs me about £</label>' +
      '<input id="takeaway" type="number" min="1" max="50" step="0.5" value="' + (p.takeaway / 100) + '"></div>' +
      '<p class="fine">Each meal you mark as cooked saves the takeaway price minus what that meal costs from your shopping list.</p>' +
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
  window.__mealPlanner = { RECIPES: RECIPES, ING: ING, allowed: allowed, generatePlan: generatePlan, defaultPrefs: defaultPrefs, planCost: planCost, shoppingLines: shoppingLines, pool: pool };
})();
