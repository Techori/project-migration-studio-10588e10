# Incubation, People and Country Pages

## Build
- Replace every visual on the Startup & Business Incubation Centers service page, including its service-list image and hero, with the supplied Riloyd corporate lobby image.
- Add dedicated `/investors`, `/mentors`, and `/team` pages in the current Riloyd visual language, using professional role/category sections and clear enquiry or registration actions without inventing real people.
- Add dedicated pages for India, UK, UAE, Canada, USA, Singapore, Europe, and Australia under `/global-presence/$slug`.
- Reuse each market’s existing landmark image and regional Riloyd logo, with market-specific positioning, opportunity themes, and contact links.
- Change Global Presence country cards and relevant About-page market links to open the correct country page.

## Footer
- Keep the main header unchanged.
- Add Investors, Mentors, Team, and all country links to the footer.
- On mobile, place Explore and Our Services side by side to use the available width; place Global Presence links in a compact two-column group below them.

## Verification
- Check the incubation service, people pages, all country URLs, footer links, and desktop/mobile overflow.
- Confirm each new page has unique search and social metadata and that the final build is clean.

## Technical details
- Keep service details in `src/components/services/` and use the existing shared dynamic service route.
- Centralize market content in one browser-safe configuration module and render all country pages through one dynamic TanStack route using typed params.
- Use the CDN asset pointer for the supplied lobby image rather than committing the binary file.
