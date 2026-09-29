# Owner Portal information architecture

| Module | Canonical route | Purpose | Hotel context | Primary data | Primary action | Backend source |
|---|---|---|---|---|---|---|
| Overview | `/owner/overview` | Owner's property portfolio and attention context from actual hotel states | None | Owned hotels and returned status/count fields | Add a hotel | `GET /owner/hotels` |
| Hotels | `/owner/hotels` | Search/filter the owner's hotels and open hotel profile | None | Owned hotel identity/status | Open or add hotel | `GET /owner/hotels`; existing hotel detail APIs |
| Hotel detail | `/owner/hotels/:hotelId` | Edit one hotel's profile, policy, amenities and images | Hotel in path | Hotel record and its relations | Save hotel changes | Existing `/owner/hotels/:hotelId` APIs |
| Room Types | `/owner/room-types?hotelId=…` | List/create room types for the selected hotel | Required; sole hotel auto-selects | Hotel-scoped room types | Add a room type / edit a type | Existing hotel room type APIs |
| Room type detail | `/owner/room-types/:roomTypeId` | Edit one room type | Room type identifies its hotel | Room type, amenities and images | Save room type | Existing `/owner/room-types/:roomTypeId` APIs |
| Inventory & Pricing | `/owner/inventory-pricing?hotelId=…` | Edit returned daily rates for a room type and date range | Required; sole hotel auto-selects | Room types plus `QUY_PHONG_GIA` rows | Bulk update selected date range | Existing room type rate API |
| Bookings | `/owner/bookings?hotelId=…` | Search, filter and page through bookings for one hotel | Required; sole hotel auto-selects | Hotel-scoped booking list | Open booking detail | Existing hotel booking API |
| Booking detail | `/owner/bookings/:bookingId?hotelId=…` | Inspect one booking in the Booking module | Required by current API; shown as metadata | Booking detail, guest, room and payment rows | Print booking sheet | Existing hotel booking detail API |
| Revenue | `/owner/revenue?hotelId=…` | Finance-focused view of actual gross, refunds and net received | Required; sole hotel auto-selects | Backend analytics finance metrics | Choose date range | Existing owner analytics API |
| Reports | `/owner/reports?hotelId=…` | Operations view of booking mix, popular rooms and occupancy | Required; sole hotel auto-selects | Backend booking/status/room/occupancy metrics | Choose date range | Existing owner analytics API |
| Profile | `/owner/profile` | Edit authenticated owner's personal account | None | Account profile | Save profile | Shared profile APIs |

Hotel scope is part of module URL state, not a navigation page. With no hotels, hotel-scoped modules show an inline empty state and a route to create a hotel. With one hotel the ID is inserted automatically. With multiple hotels the user chooses in the current module. No “all hotels” scope is exposed because booking and analytics APIs are per hotel.
