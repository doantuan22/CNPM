# Owner route migration map

| Old route | New/canonical route | Parameter semantics | Migration | Status |
|---|---|---|---|---|
| `/owner` | `/owner/overview` | None | Replace redirect | Legacy alias |
| `/partner/dashboard` | `/owner/overview` | None | Replace redirect | Legacy alias |
| `/partner/hotels` | `/owner/hotels` | None | Replace redirect | Legacy alias |
| `/owner/hotels/:id` | `/owner/hotels/:hotelId` | `hotelId` | Preserve page; rename semantic param in UI | Canonical hotel detail |
| `/partner/hotels/new`, `/owner/hotels/new`, `/partner/hotel-form` | `/owner/hotels/new` | None | Keep create page; old paths redirect | Legacy aliases |
| `/partner/room-types`, `/partner/room-type-form` | `/owner/room-types?hotelId=…` | Query `hotelId`; detail `roomTypeId` | Redirect module alias to canonical module, retain query if provided | Legacy aliases |
| `/partner/hotels/:id/room-types` | `/owner/room-types?hotelId=:id` | Old `id` is `hotelId` | Replace with redirect; do not pass it to room type detail | Broken legacy contract fixed |
| `/owner/room-types/:id` | `/owner/room-types/:roomTypeId` | `roomTypeId` | Preserve endpoint, clarify semantic param | Canonical room type detail |
| `/partner/inventory-pricing` | `/owner/inventory-pricing` | Query `hotelId`; selected room type is query state | Replace route, preserve context query | Canonical module |
| `/partner/bookings` | `/owner/bookings` | Query `hotelId` required by current backend | Replace route, selector is inside page | Canonical module |
| `/owner/hotels/:id/bookings` | `/owner/bookings?hotelId=:id` | Legacy `id` is `hotelId` | Redirect preserving hotel scope | Legacy alias |
| `/owner/hotels/:id/bookings/:bookingId` | `/owner/bookings/:bookingId?hotelId=:id` | `hotelId`, `bookingId` | Redirect preserving both IDs | Legacy alias |
| `/partner/revenue` | `/owner/revenue` | Query `hotelId` | Replace route | Canonical module |
| `/partner/reports` | `/owner/reports` | Query `hotelId` | Replace route | Canonical module |
| `/owner/hotels/:id/analytics` | `/owner/revenue?hotelId=:id` | Legacy `id` is `hotelId` | Redirect to finance module; reports has its own route | Legacy alias |
| `/profile` | `/owner/profile` in owner portal | None | Keep `/profile` compatibility; owner topbar/sidebar use owner route | Canonical owner entry plus shared alias |

`id` is not used ambiguously in new page components. Hotel, room type, and booking IDs retain existing API semantics and ownership checks.
