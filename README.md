# student-meal-planner
apatel555.github.io/student-meal-planner
Student Meal Planner

A small web app that plans a week of breakfasts, lunches and dinners on a student budget and gives you one shopping list to go with it.

Live version: https://apatel555.github.io/student-meal-planner/

Most meal planning apps assume you have a full kitchen and a normal food budget. If you're in halls with a microwave, a shared hob and about £30 a week, they don't help much. This one asks what you can actually cook with and spend, then builds the week around that.

How it works

You answer four questions: your weekly budget and supermarket (Aldi, Lidl, Asda, Tesco or Sainsbury's), your diet and any allergies, what kitchen you have and how well you cook, and what's already in your cupboard. It then picks 21 meals, breakfast, lunch and dinner for each day, and adds everything up into a single list.

Other bits:

Swap any meal for a different one that still fits your settings
See the same plan priced at all five supermarkets
A "Use it up" tab where you tick what's left in the fridge and it suggests meals that use it
Mark meals as cooked and it works out what you've saved compared with a takeaway (I've set that to £8 for lunch or dinner and £4 for breakfast, but you can change both)
Copy or print the shopping list

Rough edges

The prices are estimates, not live supermarket prices. I set what I could from published 2026 figures (Aldi price announcements, Which? and a couple of price trackers) and guessed the rest. They're at the top of app.js if you want to correct them. The gap between supermarkets is a compromise too: Which? has Aldi about 17% cheaper than Tesco on a big mixed basket but only about 3% on basic own-brand items, so I've set Aldi about 8% below.

There are 64 recipes right now. With strict settings, say vegan, gluten free and microwave only, you'll still see the same meals come round more than once.

The allergy and diet filters work from the ingredients in each recipe. They know nothing about cross-contamination, so check the packaging.

Everything is saved in your browser (localStorage). There are no accounts and no server, so clearing your browser data wipes it.
