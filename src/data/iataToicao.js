const iataToIcaoMap = {
  ATL: 'KATL',
  PEK: 'ZBAA',
  LAX: 'KLAX',
  HND: 'RJTT',
  ORD: 'KORD',
  LHR: 'EGLL',
  HKG: 'VHHH',
  ICN: 'RKSI',
  DXB: 'OMDB',
  KUL: 'WMKK',
  DEL: 'VIDP',
  JFK: 'KJFK',
  CDG: 'LFPG',
  SIN: 'WSSS',
  AMS: 'EHAM',
  DFW: 'KDFW',
  SFO: 'KSFO',
  SYD: 'YSSY',
  MIA: 'KMIA',
  BKK: 'VTBS',
  GRU: 'SBGR',
  ZRH: 'LSZH',
  BOM: 'VABB',
  YYZ: 'CYYZ',
  EWR: 'KEWR',
  DUB: 'EIDW',
  FCO: 'LIRF',
  MAD: 'LEMD',
  VIE: 'LOWW',
  BRU: 'EBBR',
  CPT: 'FACT',
  JNB: 'FAJS',
  NRT: 'RJTT',
  MUC: 'EDDM',
  CPH: 'EKCH',
  HEL: 'EFHK',
  OSL: 'ENGM',
  ARN: 'ESSA',
  WAW: 'EPWA',
  LIM: 'SPIM',
  SCL: 'SCEL',
  AUA: 'TNCA',
  PTY: 'MPTO',
  MVD: 'SUMU',
  ASU: 'SGAS',
  ACC: 'DGAA',
  LOS: 'DNAA',
  KWI: 'OKBK',
  DOH: 'OTBD',
  RUH: 'OERK',
  JED: 'OEJN',
  SAW: 'LTFM',
  IST: 'LTFM',
  KIX: 'RJBB',
  NGO: 'RJGG',
  NBO: 'HKJK',
  DAR: 'HTDA',
  LUN: 'FLLS',
  HRE: 'FVHA',
  EBB: 'HUEN',
  WAW: 'EPWA',
  AUH: 'OMAA',
  KHI: 'PAKL',
  DAC: 'VGHS',
  CCU: 'VECC',
  BLR: 'VOBL',
  HYD: 'VEHY',
  MAA: 'VOMM',
  PNQ: 'VAPO',
  STL: 'KSTL',
  LAS: 'KLAS',
  SAN: 'KSAN',
  MKE: 'KMKE',
  MSP: 'KMSP',
  BWI: 'KBWI',
  DCA: 'KDCA',
  SEA: 'KSEA',
  PHX: 'KPHX',
  PIT: 'KPIT',
  CLE: 'KCLE',
  IAD: 'KIAD',
  MEM: 'KMEM',
  CVG: 'KCVG',
  RDU: 'KRDU',
  BHM: 'KBHM',
  SJC: 'KSJC',
  SFO: 'KSFO',
  OAK: 'KOAK',
  FLL: 'KFLL',
  RSW: 'KRSW',
  TPA: 'KTPA',
  MIA: 'KMIA',
  BNA: 'KBNA',
  SDF: 'KSDF',
  IAH: 'KIAH',
  DFW: 'KDFW',
  MCO: 'KMCO',
  RSW: 'KRSW',
  TPA: 'KTPA',
  PBI: 'KPBI',
  JAC: 'KJAC',
  BOI: 'KBOI',
  SLC: 'KSLC',
  GEG: 'KGEG',
  SMF: 'KSMF',
  SAN: 'KSAN',
  LGB: 'KLGB',
  ONT: 'KONT',
  BUR: 'KBUR',
  LAX: 'KLAX',
  DCA: 'KDCA',
  IAH: 'KIAH',
  SFO: 'KSFO',
  DEN: 'KDEN',
  ORD: 'KORD',
  JFK: 'KJFK',
  PHL: 'KPHL',
  ATL: 'KATL',
  DFW: 'KDFW',
  MIA: 'KMIA',
  SEA: 'KSEA',
  LAS: 'KLAS',
  PHX: 'KPHX',
  MKE: 'KMKE',
  TPA: 'KTPA',
  RSW: 'KRSW',
  FLL: 'KFLL',
  BWI: 'KBWI',
  SFO: 'KSFO',
  OAK: 'KOAK',
  SJC: 'KSJC',
  SMF: 'KSMF',
  SAN: 'KSAN',
  LGB: 'KLGB',
  BUR: 'KBUR',
  PBI: 'KPBI',
  DAB: 'KDAB',
  BHM: 'KBHM',
  AUS: 'KAUS',
  SAT: 'KSAT',
  DAL: 'KDAL',
  LIT: 'KLIT',
  MCI: 'KMCI',
  OKC: 'KOKC',
  STL: 'KSTL',
  CVG: 'KCVG',
  RDU: 'KRDU',
  SDF: 'KSDF',
  PIT: 'KPIT',
  DCA: 'KDCA',
  IAD: 'KIAD',
  IAH: 'KIAH',
  MCO: 'KMCO',
  DFW: 'KDFW',
  ORD: 'KORD',
  DEN: 'KDEN',
  ATL: 'KATL',
  LAX: 'KLAX',
  PHX: 'KPHX',
  SEA: 'KSEA',
  SAN: 'KSAN',
  MIA: 'KMIA',
  FLL: 'KFLL',
  TPA: 'KTPA',
  RSW: 'KRSW',
  DAB: 'KDAB',
  SJC: 'KSJC',
  SMF: 'KSMF',
  OAK: 'KOAK',
  LGB: 'KLGB',
  BUR: 'KBUR',
  PBI: 'KPBI',
  JAC: 'KJAC',
  BOI: 'KBOI',
  GEG: 'KGEG',
  SLC: 'KSLC',
  BOI: 'KBOI',
  GEG: 'KGEG',
  SLC: 'KSLC',
  CVG: 'KCVG',
  SDF: 'KSDF',
  RDU: 'KRDU',
  MCI: 'KMCI',
  STL: 'KSTL',
  SAT: 'KSAT',
  DAL: 'KDAL',
  LIT: 'KLIT',
  AUS: 'KAUS',
  DCA: 'KDCA',
  ORD: 'KORD',
  DFW: 'KDFW',
  LAX: 'KLAX',
  ATL: 'KATL',
  MIA: 'KMIA',
  SFO: 'KSFO',
  SEA: 'KSEA',
  PHX: 'KPHX',
  DEN: 'KDEN',
  IAH: 'KIAH',
  DCA: 'KDCA',
  JFK: 'KJFK',
  MIA: 'KMIA',
  BWI: 'KBWI',
  RSW: 'KRSW',
  TPA: 'KTPA',
  FLL: 'KFLL',
  BHM: 'KBHM',
  DAB: 'KDAB',
  PBI: 'KPBI',
  BUR: 'KBUR',
  LGB: 'KLGB',
  SJC: 'KSJC',
  OAK: 'KOAK',
  SMF: 'KSMF',
  GEG: 'KGEG',
  SLC: 'KSLC',
  JAC: 'KJAC',
  BOI: 'KBOI',
  PIT: 'KPIT',
  CVG: 'KCVG',
  SDF: 'KSDF',
  RDU: 'KRDU',
  MCI: 'KMCI',
  OKC: 'KOKC',
  STL: 'KSTL',
  DAL: 'KDAL',
  SAT: 'KSAT',
  LIT: 'KLIT',
  AUS: 'KAUS',
};

module.exports = iataToIcaoMap;
