# Nexpedia Travel Website

A responsive multi-page travel website built with HTML, CSS, and JavaScript. The project is intentionally front-end only, so interactive data such as sign-in state and custom listed locations is stored in the browser session instead of a database.

---

## Pages Included

- `Homepage/index.html`
- `SearchResults/index.html`
- `HelpCenter/index.html`
- `Trips/index.html`
- `CheckoutPage/index.html`

Shared behavior and shared styling live in:

- `shared/common.js`
- `shared/common.css`

---

## How to Run the Project Locally

1. Download and unzip the submitted project folder.
2. Open the `TravelWebsite` folder in VS Code or another editor.
3. Start from `Homepage/index.html` by opening it directly in a browser.
4. Optional: for a local server, run one of these commands from inside the `TravelWebsite` folder, then open the shown localhost URL:

```bash
python3 -m http.server 8000
```

or

```bash
python -m http.server 8000
```

---

### Responsive Implementation

- Mobile-first layouts remain usable around 375px.
- Desktop layouts remain usable around 1280px.
- Mobile hamburger menus open and close on every page.
- Desktop navigation stays horizontal and visible.
- Active navigation styling is applied through the shared navigation helper.
- A desktop Home link is added so the homepage is always reachable from the results page.
- Touch targets, buttons, forms, cards, and modals use responsive sizing and relative units.
- Mobile date inputs stay inside their form columns, and the hamburger menu keeps dark mode and accessibility controls compact.

### Interactive Search & Micro-Interactions

- Homepage search is now an initial input point only; it shows suggestions and routes to Search Results without hiding or changing homepage cards.
- Search Results filters listings in real time by destination, dates, travelers, price, property type, guest rating, region, and amenities.
- Search suggestions update while typing.
- Empty and no-results states are handled.
- The default Search Results status message is intentionally blank until the user takes an action.
- Loading states appear for search input, search submit, and filter updates.
- Animations include button/card hover transitions, modal fade-up, loading spinner, and map point hover interactions.

### Form Validation & User Feedback

- The shared sign-in/sign-up modal works from every page.
- Sign-up includes first name, email, password, and confirm password validation.
- Sign-in includes email and password validation.
- The session-only property listing form validates location name, city/country, price, traveler capacity, latitude, longitude, and availability dates.
- Checkout form validation still includes inline feedback and success states.
- Errors appear next to the relevant fields and clear when the user fixes the input.

### Accessibility & Dark Mode

- Dark mode applies across pages, cards, forms, modals, search states, and dynamically injected content.
- Currency and theme preferences persist through localStorage.
- Sign-in state, search state, and user-listed locations persist for the current browser session through sessionStorage.
- Focus states are visible for interactive controls.
- Text uses scalable units in shared patches and is designed to remain readable when zoomed.
- Reduced-motion preferences are respected for added animations.

---

## Feature Summary

### Homepage

- The homepage remains stable after searching.
- Search suggestions still appear while typing, but results only change on the Search Results page.
- A new “Popular stays around the world” map section uses the provided world SVG and plots all destinations on top of it.
- Map points and map chips link directly to Search Results for that destination.
- Thirty destination cards are added dynamically, including locations that use same-size illustrated placeholders when no photo is available.
- The homepage shows the first five trip ideas by default and reveals the rest with a Show more button to keep mobile scrolling manageable.

### Search Results

- Expanded results include 30 preset year-round destinations across North America, the Caribbean, South America, Europe, Africa, the Middle East, and Asia Pacific, plus any session-only user listing.
- Sidebar filters now include:
  - Price presets and custom min/max pricing
  - Property type
  - Guest rating
  - Region
  - Amenities
- Dates and traveler counts update the visible cards and add context to each result card.
- Checkout links update with the selected destination, dates, travelers, and price.
- Active filter chips can remove individual search/date/traveler/sidebar filters.

### Sign In / Sign Up

- The working validation modal is injected on every page through `shared/common.js`.
- After successful sign-in or sign-up, nav buttons change to greet the user for the current session.
- Legacy sign-in modal buttons are bypassed by the shared modal so the same validation behavior is used everywhere.

### List Your Location

- “List your property” now opens a session-only listing flow only from that navigation action.
- If the user is not logged in, the site asks them to sign in/sign up first.
- After login, the listing form saves one custom location and its availability dates in `sessionStorage`.
- The new location appears in Search Results and on the homepage map for the current browser session only.
- Refreshing within the same session keeps it; closing the session removes it because there is no database.

### Currency

- The currency toggle updates static prices, dynamically added prices, checkout summaries, listing cards, filter labels, and placeholder-driven destination cards.
- Currency rates are static preview values for local-only use.

---

## Notes

- This is a client-side website with no backend.
- Session-only data uses `sessionStorage`.
- Currency conversion uses static preview exchange rates.
- Some added destinations intentionally use placeholders because the project does not include photos for every location.
