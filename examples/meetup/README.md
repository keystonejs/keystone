# Demo Project: Meetup

// TODO

## Running the Project.

To run this project, open your terminal and run `yarn` within the Keystone project root to install all required packages, then run `yarn start meetup` to begin running Keystone.

The Keystone Admin UI is reachable from `localhost:3000/admin`. To log in, use the following credentials:

Username: `admin@keystonejs.com`
Password: `password`

## Mongoose query issue

steps to reproduce

1. switch to this branch
2. run `yarn`
3. run `meetup` example with `yarn dev`
4. let this seed database with 60000 events with 5 talks each.
5. Go to `AdminUI`
6. Go to `Talks` list
7. Filter Talks with `event = <select any one from dropdown >`
8. notice the huge delay, on my macbook pro it takes almost 30 seconds

have mongodb running in verbose mode to see the query aggregate in console,
OR
during this long wait you can run `db.currentOp()` (switch to correct db first) in mongo shell to see what is going on in the mongodb right now, depending upon when you run this you will have similar result like this, it has the aggregate it is trying to run.

```js
{
    "inprog" : [
        {
            "host" : "server:27017",
            "desc" : "conn235",
            "connectionId" : 235,
            "client" : "127.0.0.1:59566",
            "appName" : "MongoDB Shell",
            "clientMetadata" : {
                "application" : {
                    "name" : "MongoDB Shell"
                },
                "driver" : {
                    "name" : "MongoDB Internal Client",
                    "version" : "4.0.5-18-g7e327a9"
                },
                "os" : {
                    "type" : "Darwin",
                    "name" : "Mac OS X",
                    "architecture" : "x86_64",
                    "version" : "19.6.0"
                }
            },
            "active" : true,
            "currentOpTime" : "2020-09-05T02:21:17.552+0530",
            "opid" : 462093,
            "lsid" : {
                "id" : UUID("ea09c285-b4e3-4fde-bcfd-65a473e62d7f"),
                "uid" : { "$binary" : "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=", "$type" : "00" }
            },
            "secs_running" : NumberLong(0),
            "microsecs_running" : NumberLong(47),
            "op" : "command",
            "ns" : "admin.$cmd.aggregate",
            "command" : {
                "currentOp" : 1.0,
                "lsid" : {
                    "id" : UUID("ea09c285-b4e3-4fde-bcfd-65a473e62d7f")
                },
                "$readPreference" : {
                    "mode" : "secondaryPreferred"
                },
                "$db" : "admin"
            },
            "numYields" : 0,
            "locks" : {},
            "waitingForLock" : false,
            "lockStats" : {}
        },
        {
            "host" : "server:27017",
            "desc" : "conn227",
            "connectionId" : 227,
            "client" : "127.0.0.1:57989",
            "clientMetadata" : {
                "driver" : {
                    "name" : "nodejs|Mongoose",
                    "version" : "3.5.10"
                },
                "os" : {
                    "type" : "Darwin",
                    "name" : "darwin",
                    "architecture" : "x64",
                    "version" : "19.6.0"
                },
                "platform" : "'Node.js v12.18.3, LE (unified)",
                "version" : "3.5.10|5.9.29"
            },
            "active" : true,
            "currentOpTime" : "2020-09-05T02:21:17.552+0530",
            "opid" : 462090,
            "lsid" : {
                "id" : UUID("801e45b8-71ad-48ad-860c-c545c44105f0"),
                "uid" : { "$binary" : "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=", "$type" : "00" }
            },
            "secs_running" : NumberLong(1),
            "microsecs_running" : NumberLong(1449520),
            "op" : "command",
            "ns" : "meetup-fix-query.events",
            "command" : {
                "aggregate" : "talks",
                "pipeline" : [
                    {
                        "$lookup" : {
                            "from" : "events",
                            "as" : "ckeopr2f90007t1g297pq23om_event",
                            "let" : {
                                "tmpVar" : "$event"
                            },
                            "pipeline" : [
                                {
                                    "$match" : {
                                        "$expr" : {
                                            "$eq" : [
                                                "$_id",
                                                "$$tmpVar"
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$match" : {
                                        "_id" : {
                                            "$eq" : ObjectId("5f52a6f6f015e575a64044a7")
                                        }
                                    }
                                },
                                {
                                    "$addFields" : {
                                        "id" : "$_id"
                                    }
                                },
                                {
                                    "$project" : {
                                        "speakers" : 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$match" : {
                            "$expr" : {
                                "$eq" : [
                                    {
                                        "$size" : "$ckeopr2f90007t1g297pq23om_event"
                                    },
                                    1
                                ]
                            }
                        }
                    },
                    {
                        "$addFields" : {
                            "id" : "$_id"
                        }
                    },
                    {
                        "$project" : {
                            "speakers" : 0,
                            "ckeopr2f90007t1g297pq23om_event" : 0
                        }
                    },
                    {
                        "$count" : "count"
                    }
                ],
                "cursor" : {},
                "lsid" : {
                    "id" : UUID("801e45b8-71ad-48ad-860c-c545c44105f0")
                },
                "$db" : "meetup-fix-query"
            },
            "planSummary" : "COLLSCAN",
            "numYields" : 145,
            "locks" : {
                "Global" : "r",
                "Database" : "r",
                "Collection" : "r"
            },
            "waitingForLock" : false,
            "lockStats" : {
                "Global" : {
                    "acquireCount" : {
                        "r" : NumberLong(27413)
                    }
                },
                "Database" : {
                    "acquireCount" : {
                        "r" : NumberLong(27413)
                    }
                },
                "Collection" : {
                    "acquireCount" : {
                        "r" : NumberLong(27412)
                    }
                }
            }
        },
        {
            "host" : "server:27017",
            "desc" : "conn223",
            "connectionId" : 223,
            "client" : "127.0.0.1:57985",
            "clientMetadata" : {
                "driver" : {
                    "name" : "nodejs|Mongoose",
                    "version" : "3.5.10"
                },
                "os" : {
                    "type" : "Darwin",
                    "name" : "darwin",
                    "architecture" : "x64",
                    "version" : "19.6.0"
                },
                "platform" : "'Node.js v12.18.3, LE (unified)",
                "version" : "3.5.10|5.9.29"
            },
            "active" : true,
            "currentOpTime" : "2020-09-05T02:21:17.552+0530",
            "opid" : 462089,
            "lsid" : {
                "id" : UUID("99e0ce8b-04c6-4070-a863-ecf24ca4aceb"),
                "uid" : { "$binary" : "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=", "$type" : "00" }
            },
            "secs_running" : NumberLong(1),
            "microsecs_running" : NumberLong(1449790),
            "op" : "command",
            "ns" : "meetup-fix-query.events",
            "command" : {
                "aggregate" : "talks",
                "pipeline" : [
                    {
                        "$lookup" : {
                            "from" : "events",
                            "as" : "ckeopr2f80006t1g22ehyd0qi_event",
                            "let" : {
                                "tmpVar" : "$event"
                            },
                            "pipeline" : [
                                {
                                    "$match" : {
                                        "$expr" : {
                                            "$eq" : [
                                                "$_id",
                                                "$$tmpVar"
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$match" : {
                                        "_id" : {
                                            "$eq" : ObjectId("5f52a6f6f015e575a64044a7")
                                        }
                                    }
                                },
                                {
                                    "$addFields" : {
                                        "id" : "$_id"
                                    }
                                },
                                {
                                    "$project" : {
                                        "speakers" : 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$match" : {
                            "$expr" : {
                                "$eq" : [
                                    {
                                        "$size" : "$ckeopr2f80006t1g22ehyd0qi_event"
                                    },
                                    1
                                ]
                            }
                        }
                    },
                    {
                        "$addFields" : {
                            "id" : "$_id"
                        }
                    },
                    {
                        "$project" : {
                            "speakers" : 0,
                            "ckeopr2f80006t1g22ehyd0qi_event" : 0
                        }
                    },
                    {
                        "$sort" : {
                            "event" : 1
                        }
                    },
                    {
                        "$limit" : 50
                    }
                ],
                "cursor" : {},
                "lsid" : {
                    "id" : UUID("99e0ce8b-04c6-4070-a863-ecf24ca4aceb")
                },
                "$db" : "meetup-fix-query"
            },
            "planSummary" : "COLLSCAN",
            "numYields" : 173,
            "locks" : {},
            "waitingForLock" : false,
            "lockStats" : {
                "Global" : {
                    "acquireCount" : {
                        "r" : NumberLong(27121)
                    }
                },
                "Database" : {
                    "acquireCount" : {
                        "r" : NumberLong(27121)
                    }
                },
                "Collection" : {
                    "acquireCount" : {
                        "r" : NumberLong(27120)
                    }
                }
            }
        }
    ],
    "ok" : 1.0
}
```


#### Aggregate performance and explain

I did  a quick explain query for the aggregation pipeline above with command
```js
db.getCollection('talks').explain(true).aggregate([ 
                    {
                        "$lookup" : {
                            "from" : "events",
                            "as" : "ckeopr2f80006t1g22ehyd0qi_event",
                            "let" : {
                                "tmpVar" : "$event"
                            },
                            "pipeline" : [ 
                                {
                                    "$match" : {
                                        "$expr" : {
                                            "$eq" : [ 
                                                "$_id", 
                                                "$$tmpVar"
                                            ]
                                        }
                                    }
                                }, 
                                {
                                    "$match" : {
                                        "_id" : {
                                            "$eq" : ObjectId("5f52a6f6f015e575a64044a7")
                                        }
                                    }
                                }, 
                                {
                                    "$addFields" : {
                                        "id" : "$_id"
                                    }
                                }, 
                                {
                                    "$project" : {
                                        "speakers" : 0
                                    }
                                }
                            ]
                        }
                    }, 
                    {
                        "$match" : {
                            "$expr" : {
                                "$eq" : [ 
                                    {
                                        "$size" : "$ckeopr2f80006t1g22ehyd0qi_event"
                                    }, 
                                    1
                                ]
                            }
                        }
                    }, 
                    {
                        "$addFields" : {
                            "id" : "$_id"
                        }
                    }, 
                    {
                        "$project" : {
                            "speakers" : 0,
                            "ckeopr2f80006t1g22ehyd0qi_event" : 0
                        }
                    }, 
                    {
                        "$sort" : {
                            "event" : 1
                        }
                    }, 
                    {
                        "$limit" : 50
                    }
                ])
```

#### Aggregation pipeline Explain result

result from above explain, notice that it has gone through each and every record of Talks and took more than 29 seconds. the winning plan is COLSCAN which is expensive.

```js
/* 1 */
{
    "stages" : [ 
        {
            "$cursor" : {
                "query" : {},
                "queryPlanner" : {
                    "plannerVersion" : 1,
                    "namespace" : "meetup-fix-query.talks",
                    "indexFilterSet" : false,
                    "parsedQuery" : {},
                    "winningPlan" : {
                        "stage" : "COLLSCAN",
                        "direction" : "forward"
                    },
                    "rejectedPlans" : []
                },
                "executionStats" : {
                    "executionSuccess" : true,
                    "nReturned" : 300002,
                    "executionTimeMillis" : 29173,
                    "totalKeysExamined" : 0,
                    "totalDocsExamined" : 300002,
                    "executionStages" : {
                        "stage" : "COLLSCAN",
                        "nReturned" : 300002,
                        "executionTimeMillisEstimate" : 78,
                        "works" : 300004,
                        "advanced" : 300002,
                        "needTime" : 1,
                        "needYield" : 0,
                        "saveState" : 2399,
                        "restoreState" : 2399,
                        "isEOF" : 1,
                        "invalidates" : 0,
                        "direction" : "forward",
                        "docsExamined" : 300002
                    },
                    "allPlansExecution" : []
                }
            }
        }, 
        {
            "$lookup" : {
                "from" : "events",
                "as" : "ckeopr2f80006t1g22ehyd0qi_event",
                "let" : {
                    "tmpVar" : "$event"
                },
                "pipeline" : [ 
                    {
                        "$match" : {
                            "$expr" : {
                                "$eq" : [ 
                                    "$_id", 
                                    "$$tmpVar"
                                ]
                            }
                        }
                    }, 
                    {
                        "$match" : {
                            "_id" : {
                                "$eq" : ObjectId("5f52a6f6f015e575a64044a7")
                            }
                        }
                    }, 
                    {
                        "$addFields" : {
                            "id" : "$_id"
                        }
                    }, 
                    {
                        "$project" : {
                            "speakers" : 0.0
                        }
                    }
                ]
            }
        }, 
        {
            "$match" : {
                "$expr" : {
                    "$eq" : [ 
                        {
                            "$size" : [ 
                                "$ckeopr2f80006t1g22ehyd0qi_event"
                            ]
                        }, 
                        {
                            "$const" : 1.0
                        }
                    ]
                }
            }
        }, 
        {
            "$addFields" : {
                "id" : "$_id"
            }
        }, 
        {
            "$project" : {
                "ckeopr2f80006t1g22ehyd0qi_event" : false,
                "speakers" : false
            }
        }, 
        {
            "$sort" : {
                "sortKey" : {
                    "event" : 1
                },
                "limit" : NumberLong(50)
            }
        }
    ],
    "ok" : 1.0
}
```