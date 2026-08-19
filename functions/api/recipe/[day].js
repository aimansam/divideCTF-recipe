/**
 * Cloudflare Pages Function for /api/recipe/<day>.
 *
 * Routing: this file lives at functions/api/recipe/[day].js, so it matches
 * GET /api/recipe/<day> where <day> is captured automatically.
 *
 * Behavior mirrors the original Flask route exactly:
 *   - Returns 404 if day is not in [1, 30].
 *   - Returns JSON with title/desc/content for days 1-29.
 *   - For day 30, returns the secret ingredient containing the FLAG env var.
 */

const RECIPES = {
  1:  { title: "Spicy Garlic Noodles", desc: "Quick wok-tossed noodles with garlic and chili.",
       content: "Ingredients: noodles, garlic, chili flakes, soy sauce, scallions.\nSteps: Boil noodles. Saute garlic + chili. Toss with soy sauce. Top scallions." },
  2:  { title: "Lemongrass Chicken", desc: "Grilled chicken with lemongrass marinade.",
       content: "Ingredients: chicken, lemongrass, garlic, soy, sugar, lime.\nSteps: Blend marinade. Coat chicken 30 min. Grill/pan-sear. Finish with lime." },
  3:  { title: "Sambal Fried Rice", desc: "Nasi goreng with sambal kick.",
       content: "Ingredients: rice, sambal, egg, soy sauce, veggies.\nSteps: Fry sambal. Add rice + soy. Stir-fry. Add egg + veggies. Serve hot." },
  4:  { title: "Coconut Curry Soup", desc: "Creamy coconut broth with veggies.",
       content: "Ingredients: coconut milk, curry paste, broth, veggies.\nSteps: Fry paste. Add broth + coconut milk. Simmer veggies. Season to taste." },
  5:  { title: "Honey Soy Salmon", desc: "Sweet-salty glaze, oven roasted.",
       content: "Ingredients: salmon, honey, soy sauce, garlic, sesame.\nSteps: Mix glaze. Brush salmon. Bake 10-12 min. Broil 1-2 min. Garnish sesame." },
  6:  { title: "Ginger Scallion Tofu", desc: "Crispy tofu with ginger scallion oil.",
       content: "Ingredients: tofu, ginger, scallions, soy sauce, oil.\nSteps: Crisp tofu. Heat oil. Add ginger+scallion. Pour over tofu. Add soy." },
  7:  { title: "Beef Pepper Stir-fry", desc: "Tender beef, bell peppers, black pepper sauce.",
       content: "Ingredients: beef, peppers, onion, black pepper, oyster sauce.\nSteps: Sear beef. Stir-fry peppers. Add sauce. Toss together 1-2 min." },
  8:  { title: "Tom Yum Pasta", desc: "Tom yum meets creamy pasta.",
       content: "Ingredients: pasta, tom yum paste, shrimp, cream, lime.\nSteps: Cook pasta. Make tom yum sauce. Add shrimp. Toss pasta. Finish with lime." },
  9:  { title: "Crispy Chicken Katsu", desc: "Panko fried chicken with sauce.",
       content: "Ingredients: chicken, flour, egg, panko.\nSteps: Bread chicken. Fry until golden. Slice. Serve with katsu sauce." },
  10: { title: "Grilled Butter Corn", desc: "Fast snack with grilled butter glaze.",
       content: "Ingredients: corn, butter, miso, sugar.\nSteps: Melt butter. Brush butter to corn. Grill on fire. Sprinkle chili if you want." },
  11: { title: "Kimchi Grilled Cheese", desc: "Melty cheese + tangy kimchi.",
       content: "Ingredients: bread, cheese, kimchi, butter.\nSteps: Butter bread. Add cheese+kimchi. Grill low until crisp and melty." },
  12: { title: "Thai Basil Omelette", desc: "Crispy edges, basil aroma.",
       content: "Ingredients: eggs, fish sauce, basil.\nSteps: Beat eggs+fish sauce. Hot oil. Pour eggs. Add basil. Flip once, serve." },
  13: { title: "Char Kuey Teow", desc: "Smoky stir-fried flat noodles (Penang style).",
       content: "Ingredients: flat rice noodles, prawns, cockles, egg, bean sprouts, chives, soy sauce, chili.\nSteps: Saute garlic & proteins. High heat toss noodles with sauce. Crack egg. Add sprouts & chives." },
  14: { title: "Sardine Curry Puff", desc: "Flaky pastry filled with spicy sardine sambal.",
       content: "Ingredients: flour, margarine, canned sardines, big onions, chili paste, lime juice.\nSteps: Saute mashed sardines with chili & onion until dry. Knead dough. Fill, fold & pleat edges. Deep fry golden." },
  15: { title: "Tepung Pelita", desc: "Traditional two-layered pandan & coconut custard.",
       content: "Ingredients: pandan leaves, rice flour, sugar, coconut milk (santan), salt, banana leaves.\nSteps: Fold leaf boats. Steam green pandan layer. Pour salty coconut layer on top. Steam until set." },
  16: { title: "Salted Egg Chicken", desc: "Creamy salted egg yolk sauce.",
       content: "Ingredients: chicken, salted egg yolk, butter, curry leaves.\nSteps: Fry chicken. Mash yolk + butter. Toss chicken. Add curry leaves." },
  17: { title: "Tuna Mayo Onigiri", desc: "Simple rice ball classic.",
       content: "Ingredients: rice, tuna, mayo, nori.\nSteps: Mix tuna+mayo. Fill rice. Shape. Wrap nori." },
  18: { title: "Teriyaki Mushrooms", desc: "Umami bite-sized mushrooms.",
       content: "Ingredients: mushrooms, soy, sugar, garlic.\nSteps: Sear mushrooms. Add sauce. Reduce until sticky." },
  19: { title: "Laksa-ish Noodle Soup", desc: "Shortcut laksa style soup.",
       content: "Ingredients: noodles, laksa paste, coconut milk, tofu.\nSteps: Simmer paste + coconut milk. Add noodles. Top tofu + herbs." },
  20: { title: "Rojak Buah", desc: "Tangy, spicy Malaysian fruit salad with crunch.",
       content: "Ingredients: sengkuang, pineapple, cucumber, green mango, crushed peanuts, rojak sauce (shrimp paste).\nSteps: Whisk paste with chili & lime. Toss bite-sized fruits & dough in sauce. Generously top with crushed peanuts." },
  21: { title: "Butter Chicken Wrap", desc: "Creamy curry in a wrap.",
       content: "Ingredients: chicken, butter, tomato, cream, tortilla.\nSteps: Cook butter chicken sauce. Toss chicken. Wrap with lettuce." },
  22: { title: "Crispy Shallot Noodles", desc: "Noodles topped with fried shallots.",
       content: "Ingredients: noodles, shallots, soy, chili.\nSteps: Fry shallots. Toss noodles with sauce. Top shallots." },
  23: { title: "Gochujang Wings", desc: "Sticky spicy Korean-style wings.",
       content: "Ingredients: wings, gochujang, honey, soy.\nSteps: Bake/fry wings. Reduce sauce. Toss until coated." },
  24: { title: "Pesto Ramen", desc: "Weirdly good basil ramen remix.",
       content: "Ingredients: ramen, pesto, egg.\nSteps: Cook ramen. Stir pesto into broth. Top egg + parmesan." },
  25: { title: "Steamed Fish", desc: "Ginger, scallion, soy drizzle.",
       content: "Ingredients: fish, ginger, scallion, soy.\nSteps: Steam fish. Heat oil. Pour soy + hot oil with aromatics." },
  26: { title: "Garlic Butter Shrimp", desc: "Fast pan shrimp with garlic.",
       content: "Ingredients: shrimp, garlic, butter, lemon.\nSteps: Sear shrimp. Add garlic + butter. Finish with lemon." },
  27: { title: "Peanut Satay Bowl", desc: "Peanut sauce over chicken + rice.",
       content: "Ingredients: chicken, peanut butter, soy, lime.\nSteps: Cook chicken. Whisk sauce. Serve over rice with cucumbers." },
  28: { title: "Tomato Egg Stir-fry", desc: "Classic comfort dish.",
       content: "Ingredients: tomato, eggs, scallion.\nSteps: Scramble eggs. Stir-fry tomato. Combine, season lightly." },
  29: { title: "Soy Sauce Chicken", desc: "Poached in soy aromatics.",
       content: "Ingredients: chicken, soy, ginger, star anise.\nSteps: Simmer soy braise. Poach chicken gently. Rest + slice." },
  30: { title: "???", desc: "Locked.", content: "" },
};

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequest(context) {
  // The "day" URL param is captured automatically by Pages Functions.
  const dayRaw = context.params.day;
  const day = parseInt(dayRaw, 10);

  if (Number.isNaN(day) || day < 1 || day > 30) {
    return json({ error: "not found" }, 404);
  }

  if (day !== 30) {
    const r = RECIPES[day];
    return json({
      day: day,
      title: r.title,
      desc: r.desc,
      content: r.content,
    });
  }

  // Day 30 is server-side only: FLAG is intentionally NOT in HTML/JS/static.
  // In Cloudflare Pages, secrets/env vars are accessed via context.env.
  const flag = (context.env && context.env.FLAG) || "FLAG{testing_flag}";

  return json({
    day: 30,
    title: "Day 30: Rendang Royale",
    desc: "The final recipe reveals the secret ingredient.",
    content: `Secret ingredient: ${flag}`,
  });
}
