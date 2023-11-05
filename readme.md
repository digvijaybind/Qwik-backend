[ 'Challenger 605', 'Learjet 45', 'B200', 'C90' ]
Socket closed
[
  { path: '/', methods: [ 'GET' ], middlewares: [ 'anonymous' ] },
  {
    path: '/all-airports',
    methods: [ 'GET' ],
    middlewares: [ 'anonymous' ]
  },
  { path: '/blog', methods: [ 'GET' ], middlewares: [ 'anonymous' ] },
  {
    path: '/admin/register',
    methods: [ 'POST' ],
    middlewares: [ 'anonymous' ]
  },
  {
    path: '/admin/login',
    methods: [ 'POST' ],
    middlewares: [ 'anonymous' ]
  },
  {
    path: '/admin/editAircraftMargin/:id',
    methods: [ 'PUT' ],
    middlewares: [ 'authMiddleware', 'anonymous' ]
  },
  {
    path: '/operator/register',
    methods: [ 'POST' ],
    middlewares: [ 'anonymous' ]     
  },
  {
    path: '/operator/login',
    methods: [ 'POST' ],
    middlewares: [ 'anonymous' ]     
  },
  {
    path: '/operator/addAircraftdeatils',
    methods: [ 'POST' ],
    middlewares: [ 'authMiddleware', 'anonymous' ]
  },
  {
    path: '/operator/getOperatorlists',
    methods: [ 'GET' ],
    middlewares: [ 'authMiddleware', 'anonymous' ]
  },
  {
    path: '/operator/editAircraft/:id',
    methods: [ 'PUT' ],
    middlewares: [ 'authMiddleware', 'anonymous' ]
  },
  {
    path: '/operator/deleteAircraft/:id',
    methods: [ 'DELETE' ],
    middlewares: [ 'authMiddleware', 'anonymous' ]
  },
  {
    path: '/operator/getSingleOperator/:id',
    methods: [ 'GET' ],
    middlewares: [ 'authMiddleware', 'anonymous' ]
res: [ 'anonymous' ]
  },
  {
    path: '/customer/customerSearch',    methods: [ 'POST' ],
    middlewares: [ 'anonymous' ]
  },
  {
    path: '/customer/customerSearchTechaul',
    methods: [ 'POST' ],      
    middlewares: [ 'anonymous' ]
  },
  {
    path: '/customer/aircraftLists',
    methods: [ 'GET' ],       
    middlewares: [ 'anonymous' ]
  }
]