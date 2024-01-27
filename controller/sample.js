{
    "meta": {
        "count": 10,
        "links": {
            "self": "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=BOM&destinationLocationCode=DXB&departureDate=2024-01-29&adults=1&max=10"
        }
    },
    "data": [
        {
            "type": "flight-offer",
            "id": "1",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 1,
            "itineraries": [
                {
                    "duration": "PT3H15M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T08:30:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-29T10:15:00"
                            },
                            "carrierCode": "AI",
                            "number": "909",
                            "aircraft": {
                                "code": "788"
                            },
                            "operating": {
                                "carrierCode": "AI"
                            },
                            "duration": "PT3H15M",
                            "id": "5",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "148.02",
                "base": "116.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "148.02"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "AI"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "148.02",
                        "base": "116.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "5",
                            "cabin": "ECONOMY",
                            "fareBasis": "ULOWBMAE",
                            "class": "U",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "2",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 1,
            "itineraries": [
                {
                    "duration": "PT3H15M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T20:10:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-29T21:55:00"
                            },
                            "carrierCode": "AI",
                            "number": "983",
                            "aircraft": {
                                "code": "788"
                            },
                            "operating": {
                                "carrierCode": "AI"
                            },
                            "duration": "PT3H15M",
                            "id": "6",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "148.02",
                "base": "116.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "148.02"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "AI"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "148.02",
                        "base": "116.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "6",
                            "cabin": "ECONOMY",
                            "fareBasis": "ULOWBMAE",
                            "class": "U",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "3",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT6H35M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T10:30:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T11:45:00"
                            },
                            "carrierCode": "WY",
                            "number": "202",
                            "aircraft": {
                                "code": "739"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "11",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T14:20:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-29T15:35:00"
                            },
                            "carrierCode": "WY",
                            "number": "609",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H15M",
                            "id": "12",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "11",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "12",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "4",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT6H50M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T16:15:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T17:30:00"
                            },
                            "carrierCode": "WY",
                            "number": "204",
                            "aircraft": {
                                "code": "789"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "15",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T20:25:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-29T21:35:00"
                            },
                            "carrierCode": "WY",
                            "number": "611",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H10M",
                            "id": "16",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "15",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "16",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "5",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT12H25M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T16:15:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T17:30:00"
                            },
                            "carrierCode": "WY",
                            "number": "204",
                            "aircraft": {
                                "code": "789"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "9",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-30T01:55:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-30T03:10:00"
                            },
                            "carrierCode": "WY",
                            "number": "601",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H15M",
                            "id": "10",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "9",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "10",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "6",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT12H35M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T10:30:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T11:45:00"
                            },
                            "carrierCode": "WY",
                            "number": "202",
                            "aircraft": {
                                "code": "739"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "13",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T20:25:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-29T21:35:00"
                            },
                            "carrierCode": "WY",
                            "number": "611",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H10M",
                            "id": "14",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "13",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "14",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "7",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT18H10M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T10:30:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T11:45:00"
                            },
                            "carrierCode": "WY",
                            "number": "202",
                            "aircraft": {
                                "code": "739"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "3",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-30T01:55:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-30T03:10:00"
                            },
                            "carrierCode": "WY",
                            "number": "601",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H15M",
                            "id": "4",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "3",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "4",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "8",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT19H15M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T16:15:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T17:30:00"
                            },
                            "carrierCode": "WY",
                            "number": "204",
                            "aircraft": {
                                "code": "789"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "7",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-30T08:45:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-30T10:00:00"
                            },
                            "carrierCode": "WY",
                            "number": "603",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H15M",
                            "id": "8",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "7",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "8",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "9",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT24H50M",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T16:15:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T17:30:00"
                            },
                            "carrierCode": "WY",
                            "number": "204",
                            "aircraft": {
                                "code": "789"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "17",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-30T14:20:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-30T15:35:00"
                            },
                            "carrierCode": "WY",
                            "number": "609",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H15M",
                            "id": "18",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "17",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "18",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "type": "flight-offer",
            "id": "10",
            "source": "GDS",
            "instantTicketingRequired": false,
            "nonHomogeneous": false,
            "oneWay": false,
            "lastTicketingDate": "2024-01-29",
            "lastTicketingDateTime": "2024-01-29",
            "numberOfBookableSeats": 6,
            "itineraries": [
                {
                    "duration": "PT25H",
                    "segments": [
                        {
                            "departure": {
                                "iataCode": "BOM",
                                "terminal": "2",
                                "at": "2024-01-29T10:30:00"
                            },
                            "arrival": {
                                "iataCode": "MCT",
                                "at": "2024-01-29T11:45:00"
                            },
                            "carrierCode": "WY",
                            "number": "202",
                            "aircraft": {
                                "code": "739"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT2H45M",
                            "id": "1",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        },
                        {
                            "departure": {
                                "iataCode": "MCT",
                                "at": "2024-01-30T08:45:00"
                            },
                            "arrival": {
                                "iataCode": "DXB",
                                "terminal": "1",
                                "at": "2024-01-30T10:00:00"
                            },
                            "carrierCode": "WY",
                            "number": "603",
                            "aircraft": {
                                "code": "7M8"
                            },
                            "operating": {
                                "carrierCode": "WY"
                            },
                            "duration": "PT1H15M",
                            "id": "2",
                            "numberOfStops": 0,
                            "blacklistedInEU": false
                        }
                    ]
                }
            ],
            "price": {
                "currency": "EUR",
                "total": "168.47",
                "base": "73.00",
                "fees": [
                    {
                        "amount": "0.00",
                        "type": "SUPPLIER"
                    },
                    {
                        "amount": "0.00",
                        "type": "TICKETING"
                    }
                ],
                "grandTotal": "168.47"
            },
            "pricingOptions": {
                "fareType": [
                    "PUBLISHED"
                ],
                "includedCheckedBagsOnly": true
            },
            "validatingAirlineCodes": [
                "WY"
            ],
            "travelerPricings": [
                {
                    "travelerId": "1",
                    "fareOption": "STANDARD",
                    "travelerType": "ADULT",
                    "price": {
                        "currency": "EUR",
                        "total": "168.47",
                        "base": "73.00"
                    },
                    "fareDetailsBySegment": [
                        {
                            "segmentId": "1",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        },
                        {
                            "segmentId": "2",
                            "cabin": "ECONOMY",
                            "fareBasis": "OPROOIA",
                            "class": "O",
                            "includedCheckedBags": {
                                "weight": 30,
                                "weightUnit": "KG"
                            }
                        }
                    ]
                }
            ]
        }
    ],
    "dictionaries": {
        "locations": {
            "BOM": {
                "cityCode": "BOM",
                "countryCode": "IN"
            },
            "DXB": {
                "cityCode": "DXB",
                "countryCode": "AE"
            },
            "MCT": {
                "cityCode": "MCT",
                "countryCode": "OM"
            }
        },
        "aircraft": {
            "7M8": "BOEING 737 MAX 8",
            "788": "BOEING 787-8",
            "789": "BOEING 787-9",
            "739": "BOEING 737-900"
        },
        "currencies": {
            "EUR": "EURO"
        },
        "carriers": {
            "WY": "OMAN AIR",
            "AI": "AIR INDIA"
        }
    }
}