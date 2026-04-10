# Travel Website

A responsive multi-page travel website built using HTML, CSS, and JavaScript.

---

## Pages Included
- Homepage
- Search Results
- Help Center
- Trips
- Checkout Page

---

## Features
- Mobile-first responsive design
- Desktop navigation bar
- Mobile hamburger menu (open/close functionality)
- Working links between all pages
- Interactive UI elements:
  - Live client-side search with real-time suggestions
  - Search empty states and no-results handling
  - Filters
  - FAQ expand/collapse
  - Trips modal and carousel
  - Checkout validation and success modal
  - Shared currency toggle with demo price conversion
  - Prototype notice for "List your property"

---

## Folder Structure
TravelWebsite/
- Homepage/
- SearchResults/
- HelpCenter/
- Trips/
- CheckoutPage/
- README.md

Each folder contains:
- index.html
- style.css
- script.js
- images/ (if used)

---

## How to Run the Project

1. Download or clone the repository
2. Open the folder in VS Code (or any editor)
3. Open:

Homepage/index.html

4. Use your browser to navigate through the site

---

## How to Test Responsiveness

Use Chrome DevTools:

- Mobile view (~375px)
- Desktop view (~1280px)

Make sure:
- No horizontal scrolling
- Buttons are clickable
- Text is readable
- Navigation works on both sizes

---

## Navigation Behavior

Desktop:
- Full navigation bar visible

Mobile:
- Hamburger menu appears
- Menu opens and closes when clicked

---

## Page Functionality

Homepage:
- Live destination search filters featured trips in real time
- Search submit can route to Search Results with the destination query

Search Results:
- Live destination search filters listing cards in real time
- URL query stays in sync with the current destination search
- Displays cards and filters

Help Center:
- FAQ sections expand/collapse
- Live help-topic search filters FAQs and expands matching answers

Trips:
- Tabs (Booked, Saved, Create)
- Live trip search filters booked trips and itinerary suggestions
- Modal and carousel

Checkout Page:
- Form validation
- Payment method selection
- Booking confirmation modal

---

## Notes

- This is a front-end prototype (no backend)
- Currency conversion uses static demo rates on the client side
- "List your property" intentionally shows a not-integrated prototype message
- Some features are simulated for demonstration
- Images may be placeholders
