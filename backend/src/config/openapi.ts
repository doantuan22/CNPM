export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hotel Booking Platform API',
    version: '1.0.0',
    description: 'REST API for the Online Hotel Booking Platform (Nền tảng đặt phòng khách sạn trực tuyến).',
  },
  servers: [
    {
      url: '/api',
      description: 'API base path',
    },
  ],
  paths: {
    '/hotels': {
      get: {
        summary: 'Search/list active hotels with price + availability (M2 — public, no auth)',
        tags: ['Discovery'],
        parameters: [
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Matches city or province (contains)' },
          { name: 'checkIn', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'checkOut', in: 'query', required: true, schema: { type: 'string', format: 'date' }, description: 'Exclusive — checkout night is not counted' },
          { name: 'guests', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'starRating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Minimum star rating' },
          { name: 'amenities', in: 'query', schema: { type: 'string' }, description: 'Comma-separated MaTienNghi ids' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['price_asc', 'price_desc', 'star_desc', 'newest'] } },
        ],
        responses: {
          '200': { description: 'Paginated hotel search results' },
          '400': { description: 'Invalid query (e.g. checkOut <= checkIn)' },
        },
      },
    },
    '/hotels/{id}': {
      get: {
        summary: 'Hotel detail — info, images, amenities (no dates required)',
        tags: ['Discovery'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Hotel detail' }, '404': { description: 'Not found or not active' } },
      },
    },
    '/hotels/{id}/rooms': {
      get: {
        summary: 'Room types for a hotel with price + availability for a date range (BE-4, read-only)',
        tags: ['Discovery'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'checkIn', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'checkOut', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'guests', in: 'query', schema: { type: 'integer' }, description: 'Filters out room types with SucChua < guests' },
        ],
        responses: {
          '200': { description: 'Room types with GiaTheoDem/TongTien/SoPhongConLai/ConHang' },
          '400': { description: 'Invalid date range' },
          '404': { description: 'Hotel not found or not active' },
        },
      },
    },
    '/hotels/{id}/quote': {
      post: {
        summary: 'Compute a booking quote (M4, public, read-only — no DAT_PHONG is created)',
        tags: ['Commercial'],
        description:
          'Backend computes everything: per-night availability/price from QUY_PHONG_GIA (checkout night excluded), promotion validity/discount, and the applicable system-wide cancellation policy. The client cannot influence TongTienThanhToan/SoTienGiam — any such fields in the body are ignored.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['checkIn', 'checkOut', 'rooms'],
                properties: {
                  checkIn: { type: 'string', format: 'date' },
                  checkOut: { type: 'string', format: 'date', description: 'Exclusive — checkout night not counted' },
                  rooms: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['maLoaiPhong', 'soLuong'],
                      properties: { maLoaiPhong: { type: 'integer' }, soLuong: { type: 'integer', minimum: 1 } },
                    },
                  },
                  promoCode: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Quote — always 200 even for an invalid/expired promo (PromoHopLe=false explains why); KhaDung=false when any room line is sold out or unpriced' },
          '400': { description: 'Invalid date range, empty/duplicate room lines, or a room id not belonging to this hotel' },
          '404': { description: 'Hotel not found or not active' },
        },
      },
    },
    '/cancellation-policies': {
      get: {
        summary: 'List active cancellation policies (public) — system-level data, no MaKhachSan/MaDatPhong',
        tags: ['Commercial'],
        responses: { '200': { description: 'Policies with their CHI_TIET_CHINH_SACH_HUY tiers' } },
      },
    },
    '/cancellation-policies/{id}': {
      get: {
        summary: 'Get one cancellation policy with its tiers',
        tags: ['Commercial'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
    '/owner/hotels': {
      get: {
        summary: "List the authenticated owner's hotels (M3)",
        tags: ['Owner'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Own hotels' }, '403': { description: 'Not a Chủ khách sạn account' } },
      },
      post: {
        summary: 'Register a new hotel — always starts at "Chờ duyệt", owner cannot self-approve',
        tags: ['Owner'],
        security: [{ BearerAuth: [] }],
        responses: { '201': { description: 'Created, pending admin approval' }, '400': { description: 'Invalid MaDiaPhuong or body' } },
      },
    },
    '/owner/hotels/{id}': {
      get: { summary: 'Get an owned hotel', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '403': { description: "Not this owner's hotel" }, '404': { description: 'Not found' } } },
      patch: { summary: 'Update an owned hotel (TrangThai/MaTaiKhoanDuyet/MaTaiKhoanSoHuu cannot be set here)', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' }, '403': { description: 'Forbidden' } } },
    },
    '/owner/hotels/{id}/amenities': {
      put: { summary: 'Replace the full amenity set for a hotel', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' } } },
    },
    '/owner/hotels/{id}/images': {
      post: { summary: 'Upload a hotel image (base64 data URI, via the existing Cloudinary integration)', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '201': { description: 'Created' } } },
    },
    '/owner/hotels/{id}/images/{imageId}': {
      patch: { summary: 'Set as the primary hotel image', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'imageId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' } } },
      delete: { summary: 'Remove a hotel image (best-effort Cloudinary delete + DB row removal)', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'imageId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/owner/hotels/{hotelId}/room-types': {
      get: { summary: 'List room types for an owned hotel', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'hotelId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
      post: { summary: 'Create a room type for an owned hotel', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'hotelId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '201': { description: 'Created' } } },
    },
    '/owner/room-types/{id}': {
      get: { summary: 'Get an owned room type', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '403': { description: 'Forbidden' }, '404': { description: 'Not found' } } },
      patch: { summary: 'Update an owned room type (including TrangThai — open/close for sale)', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' } } },
    },
    '/owner/room-types/{id}/amenities': {
      put: { summary: 'Replace the full amenity set for a room type', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' } } },
    },
    '/owner/room-types/{id}/images': {
      post: { summary: 'Upload a room-type image (base64 data URI)', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '201': { description: 'Created' } } },
    },
    '/owner/room-types/{id}/images/{imageId}': {
      patch: { summary: 'Set as the primary room-type image', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'imageId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' } } },
      delete: { summary: 'Remove a room-type image', tags: ['Owner'], security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'imageId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/owner/room-types/{id}/rates': {
      get: {
        summary: 'View QUY_PHONG_GIA for an owned room type over a date range',
        tags: ['Owner'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'from', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
        ],
        responses: { '200': { description: 'Rate rows in range' } },
      },
      put: {
        summary: 'Bulk create/update price + inventory per day (upsert on (MaLoaiPhong, NgayApDung) — never duplicates)',
        tags: ['Owner'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Upserted rows' },
          '400': { description: 'Duplicate date within the same request, or GiaPhong/SoLuongPhong < 0' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/amenities': {
      get: {
        summary: 'List all amenities (public) — supports the search filter UI',
        tags: ['Discovery'],
        responses: { '200': { description: 'List of amenities' } },
      },
    },
    '/locations': {
      get: {
        summary: 'List all DIA_PHUONG (public) — supports search location field and owner hotel-registration form',
        tags: ['Discovery'],
        responses: { '200': { description: 'List of locations' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new customer account',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '400': { description: 'Validation failed' },
          '409': { description: 'Email or TenDangNhap already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login with email/TenDangNhap and password',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '401': { description: 'Invalid credentials' },
          '403': { description: 'Account is locked' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Exchange the httpOnly refresh-token cookie for a new access token',
        tags: ['Auth'],
        responses: {
          '200': { description: 'New access token issued' },
          '401': { description: 'Missing/invalid/expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Clear the refresh-token cookie (stateless — no server-side revocation list)',
        tags: ['Auth'],
        responses: { '200': { description: 'Logged out' } },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'DEV/FOUNDATION: request a password reset (UC04). No email provider wired yet.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } },
        },
        responses: {
          '200': {
            description:
              'Always returns a generic success message regardless of whether the account exists (prevents enumeration). In non-production environments the reset token is logged server-side.',
          },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Complete a password reset using the token issued by /auth/forgot-password',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } },
        },
        responses: {
          '200': { description: 'Password updated' },
          '400': { description: 'Token invalid, expired, or already used' },
        },
      },
    },
    '/profile/me': {
      get: {
        summary: "Get the caller's own account profile",
        tags: ['Profile'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Own profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Account' } } },
          },
          '401': { description: 'Unauthenticated' },
        },
      },
      patch: {
        summary: "Update whitelisted fields of the caller's own profile (role/status cannot be changed here)",
        tags: ['Profile'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } },
        },
        responses: {
          '200': { description: 'Updated profile' },
          '401': { description: 'Unauthenticated' },
        },
      },
    },
    '/admin/accounts': {
      get: {
        summary: 'List/search/filter accounts (admin only)',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'TrangThai', in: 'query', schema: { type: 'string' } },
          { name: 'MaVaiTro', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Paginated account list' },
          '403': { description: 'Caller is not an admin' },
        },
      },
      post: {
        summary: 'Create an account with an explicit role (admin only)',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAccountRequest' } } },
        },
        responses: { '201': { description: 'Account created' }, '403': { description: 'Not an admin' } },
      },
    },
    '/admin/accounts/{id}': {
      get: {
        summary: 'Get account detail (admin only)',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Account detail' }, '404': { description: 'Not found' } },
      },
      patch: {
        summary: 'Update an account, including role reassignment (admin only)',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Updated account' } },
      },
      delete: {
        summary:
          'Delete-safe: hard-deletes only if the account has no related history (booking/review/support/hotel ownership/partner application); otherwise locks it (G0-10)',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: '{ hardDeleted: boolean }' } },
      },
    },
    '/admin/accounts/{id}/lock': {
      post: {
        summary: 'Lock an account (locked accounts cannot log in)',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Account locked' } },
      },
    },
    '/admin/accounts/{id}/unlock': {
      post: {
        summary: 'Unlock an account',
        tags: ['Admin Accounts'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Account unlocked' } },
      },
    },
    '/partners/apply': {
      post: {
        summary: 'Submit a partner (hotel owner) application — UC03 foundation. Role is NOT upgraded automatically; approval workflow is a later phase.',
        tags: ['Partners'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApplyPartnerRequest' } } },
        },
        responses: {
          '201': { description: 'Application submitted, TrangThaiDuyet = "Chờ duyệt"' },
          '409': { description: 'A pending or already-approved application exists' },
        },
      },
    },
    '/partners/me': {
      get: {
        summary: "Get the caller's latest partner application status",
        tags: ['Partners'],
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Latest application, or null if none submitted' } },
      },
    },
    '/health': {
      get: {
        summary: 'Check API and system health status',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API is running and healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Hotel Booking API is running' },
                    data: {
                      type: 'object',
                      properties: {
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number' },
                        environment: { type: 'string', example: 'development' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'object' },
        },
      },
      Account: {
        type: 'object',
        description: 'MatKhau (password hash) is never included in any API response.',
        properties: {
          MaTaiKhoan: { type: 'integer' },
          MaVaiTro: { type: 'integer' },
          TenDangNhap: { type: 'string' },
          Email: { type: 'string', format: 'email' },
          HoTen: { type: 'string' },
          SoDienThoai: { type: 'string' },
          NgaySinh: { type: 'string', format: 'date', nullable: true },
          GioiTinh: { type: 'string', enum: ['Nam', 'Nữ', 'Khác'], nullable: true },
          AnhDaiDien: { type: 'string', nullable: true },
          TrangThai: { type: 'string', example: 'Hoạt động' },
          NgayTao: { type: 'string', format: 'date-time' },
          NgayCapNhat: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        description:
          'NgaySinh/GioiTinh are optional (DDI-01 resolved: nullable in the baseline) — registration does not require them.',
        required: ['TenDangNhap', 'Email', 'MatKhau', 'HoTen', 'SoDienThoai'],
        properties: {
          TenDangNhap: { type: 'string' },
          Email: { type: 'string', format: 'email' },
          MatKhau: { type: 'string', minLength: 6 },
          HoTen: { type: 'string' },
          SoDienThoai: { type: 'string' },
          NgaySinh: { type: 'string', format: 'date', nullable: true },
          GioiTinh: { type: 'string', enum: ['Nam', 'Nữ', 'Khác'], nullable: true },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'MatKhau'],
        properties: {
          identifier: { type: 'string', description: 'Email or TenDangNhap' },
          MatKhau: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              account: { $ref: '#/components/schemas/Account' },
              accessToken: { type: 'string', description: 'Short-lived JWT (15m), sent in the body' },
            },
          },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['Email'],
        properties: { Email: { type: 'string', format: 'email' } },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'MatKhauMoi'],
        properties: { token: { type: 'string' }, MatKhauMoi: { type: 'string', minLength: 6 } },
      },
      UpdateProfileRequest: {
        type: 'object',
        description: 'Whitelist only — MaVaiTro/TrangThai/NgayTao/TenDangNhap/Email/MatKhau cannot be set here.',
        properties: {
          HoTen: { type: 'string' },
          SoDienThoai: { type: 'string' },
          NgaySinh: { type: 'string', format: 'date' },
          GioiTinh: { type: 'string', enum: ['Nam', 'Nữ', 'Khác'] },
          AnhDaiDien: { type: 'string' },
        },
      },
      CreateAccountRequest: {
        allOf: [
          { $ref: '#/components/schemas/RegisterRequest' },
          { type: 'object', required: ['MaVaiTro'], properties: { MaVaiTro: { type: 'integer' } } },
        ],
      },
      ApplyPartnerRequest: {
        type: 'object',
        required: ['SoCCCD', 'SoGiayPhepKinhDoanh', 'MaSoThue', 'TepGiayTo'],
        properties: {
          SoCCCD: { type: 'string' },
          SoGiayPhepKinhDoanh: { type: 'string' },
          MaSoThue: { type: 'string' },
          TepGiayTo: {
            type: 'string',
            description: 'M1 foundation: URL/reference string, not a real file upload yet',
          },
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
