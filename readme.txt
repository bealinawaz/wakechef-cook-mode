=== WakeChef Cook Mode – Keep Screen Awake for Recipes ===
Contributors: imalinawaz
Donate link: https://www.buymeacoffee.com/bealinawaz
Tags: cook mode, keep screen awake, recipe, cooking, food blog
Requires at least: 6.2
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.1.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Cook mode for recipes: keeps screens awake and opens a free step-by-step Cook view. Works with WP Recipe Maker, Tasty Recipes and any recipe card.

== Description ==

Nothing is more frustrating than a phone screen going dark with flour on your hands. WakeChef Cook Mode adds a simple toggle to your recipes. When a reader switches it on, their screen stays awake until they switch it off or leave the page.

**New: a step-by-step Cook view, free**

A **Start cooking** button opens the recipe full screen, built for a phone propped up on the counter:

* Ingredients with checkboxes to tick off as you gather them.
* One step at a time in large text, with Next and Previous buttons, arrow keys, or a swipe.
* Recipe sections such as "For the sauce" shown above each step.
* Four text sizes, and a dark version when the phone is in dark mode.
* The screen stays awake while the Cook view is open.
* Progress is remembered if the reader leaves the page and comes back.

**Free, with no Pro needed:** the screen-awake toggle, the full-screen Cook view with ingredient checkboxes, text sizes and dark mode, WP Recipe Maker placement, automatic placement, the block and the shortcode.

The Cook view reads the recipe data (schema.org Recipe) that recipe card plugins already add to your page for Google, so it works with WP Recipe Maker, Tasty Recipes, Create, WP Delicious, Recipe Card Blocks, Zip Recipes, Cooked, and others, with no setup. Many recipe card plugins only offer a step-by-step cook view in a paid plan or for their own cards; here it is free and works with any of them. The button only appears on pages that have recipe data.

**Add it wherever your recipes are**

* **WP Recipe Maker:** one checkbox adds the toggle to every recipe card, at the top or bottom. No template editing needed.
* **Any post type or category:** automatically add the toggle to posts, pages, or custom post types, optionally limited to recipe categories. Works with recipes from any plugin, or recipes written straight into the post.
* **Block:** insert the Cook Mode block anywhere in the block editor.
* **Shortcode:** use `[wakechef_cook_mode]` in classic content, widgets, or page builders.

**Built for real kitchens**

* Uses the browser's Screen Wake Lock API, supported in current Chrome, Edge, Safari, and Firefox.
* If the reader switches apps or tabs, Cook Mode resumes automatically when they come back.
* Every toggle on a page stays in sync, even with several recipes on one page.
* Accessible: a real switch with a label, keyboard support, and status announcements for screen readers.
* Lightweight: about 5 KB of plain JavaScript once compressed, no jQuery, and assets load only on pages that show the toggle.
* Hidden when a recipe is printed.

**Customize it**

Change the label, description, button text, and accent color under Settings → WakeChef Cook Mode, or turn the Cook view off. The block and shortcode can override the text for individual recipes.

**WakeChef Cook Mode Pro**

WakeChef Cook Mode Pro is a separate add-on for food blogs that want readers to cook straight from the Cook view. The free plugin keeps every feature above, and Pro adds:

* **Step timers:** times in each step, such as "25 minutes", "1 hr 10 min" or "10-15 min", get a Start, Pause and Reset timer under that step. The recipe's cook time becomes a timer too.
* **Several timers and an alarm:** running timers are listed in a timer tray and stay on the page after the Cook view closes. When time is up, the page beeps for about 25 seconds or until the reader stops it, and the phone vibrates where it can. The screen stays awake while a timer runs.
* **Serving scaling:** readers change the servings and the ingredient amounts update, including fractions, ranges and metric/US pairs. Sizes such as a "28-ounce can" stay as they are, and lines it can't read safely are left as written and marked.
* **Cook Mode stats:** see for each recipe how often readers turn Cook Mode on, open and finish the Cook view, complete steps and start timers, for 7, 30 or 90 days, with a CSV download, a dashboard widget and a Posts list column. Only daily totals are stored: no cookies, IP addresses or user IDs.
* **Google Analytics 4 events (optional):** send the same counts through the gtag code already on your site.

Pro reads the same recipe data as the free Cook view, so it works with the same recipe cards. WakeChef Cook Mode Pro costs from $29 a year, with a 14-day refund policy. [See WakeChef Cook Mode Pro](https://bealinawaz.com/wordpress-plugins/pro/wakechef/?utm_source=wordpress.org&utm_medium=plugin-readme&utm_campaign=wakechef-cook-mode).

Want a Cook view design that matches your recipe theme, or a feature for your own recipe setup? The plugin is built and maintained by Ali Nawaz, a WordPress developer. [Get in touch for custom work](https://bealinawaz.com/contact-me/?utm_source=wordpress.org&utm_medium=plugin-readme&utm_campaign=wakechef-cook-mode).

== Installation ==

1. Install and activate the plugin.
2. Go to **Settings → WakeChef Cook Mode**.
3. If you use WP Recipe Maker, the toggle is already added to your recipe cards. Choose the position you prefer.
4. For other recipes, choose the post types (and optionally categories) under **Automatic placement**, or add the Cook Mode block or the `[wakechef_cook_mode]` shortcode where you want it.

== Frequently Asked Questions ==

= Does it require WP Recipe Maker? =

No. WP Recipe Maker cards get the toggle automatically, but you can use the block, the shortcode, or automatic placement on any site.

= Which browsers support Cook Mode? =

Current versions of Chrome, Edge, Safari (16.4 and later), and Firefox support the Screen Wake Lock API. In browsers without support, the toggle is disabled and explains that Cook Mode isn't available.

= Why did Cook Mode turn off? =

Browsers release the wake lock when the page is hidden, for example when switching apps. Cook Mode turns back on automatically when the reader returns. Some devices also refuse the request in battery saver mode.

= Can I change the text for one recipe? =

Yes. The block has label and description settings in the sidebar, and the shortcode accepts attributes: `[wakechef_cook_mode label="Keep screen on" description="Handy while kneading"]`.

= Which recipe plugins work with the Cook view? =

Any plugin that adds schema.org Recipe data to the page, which is how recipes appear in Google's recipe results. That includes WP Recipe Maker, Tasty Recipes, Create, WP Delicious, Recipe Card Blocks by WPZOOM, Zip Recipes, and Cooked, plus SEO plugins that add recipe data. If a page has no recipe data with instructions, the Start cooking button stays hidden and only the toggle shows.

= Where does the Start cooking button appear? =

Inside the Cook Mode toggle box, wherever the toggle is placed: on WP Recipe Maker cards, through automatic placement, the block, or the shortcode. You can change its text or turn it off under Settings → WakeChef Cook Mode.

= Does the Cook view need the Screen Wake Lock API? =

The Cook view works in every modern browser. Keeping the screen awake needs the Screen Wake Lock API; where it is not available, the Cook view still opens, just without that part.

= Is anything sent to a server? =

No. The Cook view reads the recipe already on the page. The reader's checked ingredients, current step, and text size are saved only in their own browser.

= What does WakeChef Cook Mode Pro add? =

Step timers from the times in each step, several timers at once with an alarm, serving scaling for the ingredient list, and Cook Mode stats per recipe with a CSV download and optional Google Analytics 4 events. It is a separate add-on that needs this free plugin, and the free features stay free. See [WakeChef Cook Mode Pro](https://bealinawaz.com/wordpress-plugins/pro/wakechef/?utm_source=wordpress.org&utm_medium=plugin-readme&utm_campaign=wakechef-cook-mode).

= Will a Pro step timer ring when the phone is locked? =

No. Browsers pause web pages on a locked phone, so no web page can ring then. Pro keeps the screen awake while a timer runs, so the phone doesn't lock on its own. If the reader locks it anyway, the timer keeps the right time and rings as soon as the page is visible again.

= How does serving scaling handle unusual ingredients? =

Pro scales the amounts it can read with confidence and leaves the rest exactly as written, marked so the reader can check them. Scaling changes ingredient amounts only, not cooking times or pan sizes.

= Will a post show two toggles? =

No. If a post contains a WP Recipe Maker card, a Cook Mode block, or the shortcode, automatic placement skips that post.

= Is the plugin available in my language? =

The plugin is ready for translation, and translations are made by volunteers on WordPress.org. You can help translate it into your language at [translate.wordpress.org](https://translate.wordpress.org/projects/wp-plugins/wakechef-cook-mode/). Once a language is 90% translated, WordPress installs the translation automatically through language packs. A translation template, languages/wakechef-cook-mode.pot, is included for tools such as Poedit and Loco Translate.

== Screenshots ==

1. The Cook Mode toggle placed automatically at the top of a recipe post.
2. Cook Mode switched on in a phone browser: the screen stays awake while the visitor cooks.
3. Settings → WakeChef Cook Mode: label, color, Cook view, WP Recipe Maker cards and automatic placement by post type and category.
4. The Cook view on a laptop: ingredients to tick off beside the current step, with recipe sections and progress.
5. The Cook view on a phone: one step at a time in large text, with tabs for ingredients and steps.

== Changelog ==

= 1.1.3 (2026-11-19) =
* The settings page and the plugin's row on the Plugins screen mention the WakeChef Cook Mode Pro add-on. Both are hidden when Pro is active.
* Readme: clearer short description, WakeChef Cook Mode Pro section, new questions on timers and scaling.

= 1.1.2 (2026-11-15) =
* Developers: the Cook view now fires JavaScript events on `document` that add-ons can listen to: `wakechef:cookmode:change`, `wakechef:cookview:open`, `wakechef:cookview:step`, `wakechef:cookview:finish` and `wakechef:cookview:close`. Nothing changes for readers.

= 1.1.1 (2026-11-15) =
* Fixed: the Cook Mode block's labels in the block editor can now be translated (the block's JavaScript translations are loaded from WordPress.org language packs).
* Right-to-left languages: the toggle, the Start cooking arrow and the Cook view layout follow the page direction, and swiping and arrow keys move the right way in Arabic, Hebrew, Urdu and other RTL languages.
* Translations: a translation template (languages/wakechef-cook-mode.pot) is included.
* Translations: the toggle label, description, and Start cooking button text that are left at their default are no longer saved in the language the settings were saved in, so readers see them in their own language. Customized texts are kept.

= 1.1.0 (2026-11-15) =
* New: Cook view. A Start cooking button opens the recipe full screen with ingredient checkboxes and one step at a time, keeping the screen awake.
* New: works with any recipe card plugin that adds schema.org Recipe data, including WP Recipe Maker, Tasty Recipes, Create, WP Delicious, Recipe Card Blocks, Zip Recipes, and Cooked.
* New: text size buttons, swipe and arrow key navigation, recipe sections, dark mode, and remembered progress.
* New: settings to turn the Cook view off and change the button text.

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.1.3 =
Readme and WakeChef Cook Mode Pro information. Nothing to change.

= 1.1.2 =
Adds JavaScript events for add-ons. Nothing to change.

= 1.1.1 =
Translation and right-to-left language improvements. Nothing to change.

= 1.1.0 =
Adds a free step-by-step Cook view that works with any recipe card plugin. It appears automatically on pages with recipe data; turn it off under Settings if you prefer.
