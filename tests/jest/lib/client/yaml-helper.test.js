/*******************************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *******************************************************************************/

import YamlParser from "../../../../lib/client/yaml-helper";

describe("yamlParser", () => {
  it("null output", () => {
    const value = "";
    const row = 0;
    const output = new YamlParser().parse(value, row);
    expect(output).toBeNull();
  });

  it("output", () => {
    const value =
      "apiVersion: app.k8s.io/v1beta1\nkind: Application\nmetadata:\n  name: mortgage-app\n  namespace: default\n  generation: 3\nspec:\n  componentKinds:\n    - group: apps.open-cluster-management.io\n      kind: Subscription\n  descriptor: {}\n  selector:\n    matchExpressions:\n      - key: app\n        operator: In\n        values:\n          - mortgage-app-mortgage\n";
    const row = 0;
    const result = {
      apiVersion: { $r: 0, $v: "app.k8s.io/v1beta1" },
      kind: { $r: 1, $v: "Application" },
      metadata: {
        $r: 2,
        $v: {
          generation: { $r: 5, $v: 3 },
          name: { $r: 3, $v: "mortgage-app" },
          namespace: { $r: 4, $v: "default" }
        }
      },
      spec: {
        $r: 6,
        $v: {
          componentKinds: {
            $r: 7,
            $v: [
              {
                $r: 8,
                $v: {
                  group: { $r: 8, $v: "apps.open-cluster-management.io" },
                  kind: { $r: 9, $v: "Subscription" }
                }
              }
            ]
          },
          descriptor: { $r: 10, $v: {} },
          selector: {
            $r: 11,
            $v: {
              matchExpressions: {
                $r: 12,
                $v: [
                  {
                    $r: 13,
                    $v: {
                      key: { $r: 13, $v: "app" },
                      operator: { $r: 14, $v: "In" },
                      values: {
                        $r: 15,
                        $v: [{ $r: 16, $v: "mortgage-app-mortgage" }]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "name: mortgage-app #3\nnamespace: default #4\ngeneration: 3 #5";
    const row = undefined;
    const result = {
      generation: { $cmt: "5", $r: 2, $v: 3 },
      name: { $cmt: "3", $r: 0, $v: "mortgage-app" },
      namespace: { $cmt: "4", $r: 1, $v: "default" }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "componentKinds: #7\n  - group: apps.open-cluster-management.io #8\n    kind: Subscription #9\ndescriptor: {} #10\nselector: #11\n  matchExpressions: #12\n    - key: app #13\n      operator: In #14\n      values: #15\n        - mortgage-app-mortgage #16";
    const row = undefined;
    const result = {
      componentKinds: {
        $cmt: "7",
        $r: 0,
        $v: [
          {
            $r: 1,
            $v: {
              group: {
                $cmt: "8",
                $r: 1,
                $v: "apps.open-cluster-management.io"
              },
              kind: { $cmt: "9", $r: 2, $v: "Subscription" }
            }
          }
        ]
      },
      descriptor: { $cmt: "10", $r: 3, $v: {} },
      selector: {
        $cmt: "11",
        $r: 4,
        $v: {
          matchExpressions: {
            $cmt: "12",
            $r: 5,
            $v: [
              {
                $r: 6,
                $v: {
                  key: { $cmt: "13", $r: 6, $v: "app" },
                  operator: { $cmt: "14", $r: 7, $v: "In" },
                  values: {
                    $cmt: "15",
                    $r: 8,
                    $v: [{ $cmt: "16", $r: 9, $v: "mortgage-app-mortgage" }]
                  }
                }
              }
            ]
          }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "group: apps.open-cluster-management.io #8\nkind: Subscription #9\n";
    const row = undefined;
    const result = {
      group: { $r: 0, $cmt: "8", $v: "apps.open-cluster-management.io" },
      kind: { $r: 1, $cmt: "9", $v: "Subscription" }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "matchExpressions: #12\n  - key: app #13\n    operator: In #14\n    values: #15\n      - mortgage-app-mortgage #16\n";
    const row = undefined;
    const result = {
      matchExpressions: {
        $r: 0,
        $cmt: "12",
        $v: [
          {
            $r: 1,
            $v: {
              key: { $r: 1, $cmt: "13", $v: "app" },
              operator: { $r: 2, $cmt: "14", $v: "In" },
              values: {
                $r: 3,
                $cmt: "15",
                $v: [{ $v: "mortgage-app-mortgage", $r: 4, $cmt: "16" }]
              }
            }
          }
        ]
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value = "- mortgage-app-mortgage #16\n";
    const row = undefined;
    const result = [{ $cmt: "16", $r: 0, $v: "mortgage-app-mortgage" }];
    const output = new YamlParser().parse(value);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "apiVersion: apps.open-cluster-management.io/v1\nkind: Subscription\nmetadata:\n  name: mortgage-app-subscription\n  namespace: default\n  generation: 2\n  labels:\n    app: mortgage-app-mortgage\nspec:\n  channel: mortgage-ch/mortgage-channel\n  placement:\n    placementRef:\n      name: mortgage-app-placement\n      kind: PlacementRule\n";
    const row = 18;
    const result = {
      apiVersion: { $r: 18, $v: "apps.open-cluster-management.io/v1" },
      kind: { $r: 19, $v: "Subscription" },
      metadata: {
        $r: 20,
        $v: {
          name: { $r: 21, $v: "mortgage-app-subscription" },
          namespace: { $r: 22, $v: "default" },
          generation: { $r: 23, $v: 2 },
          labels: {
            $r: 24,
            $v: { app: { $r: 25, $v: "mortgage-app-mortgage" } }
          }
        }
      },
      spec: {
        $r: 26,
        $v: {
          channel: { $r: 27, $v: "mortgage-ch/mortgage-channel" },
          placement: {
            $r: 28,
            $v: {
              placementRef: {
                $r: 29,
                $v: {
                  name: { $r: 30, $v: "mortgage-app-placement" },
                  kind: { $r: 31, $v: "PlacementRule" }
                }
              }
            }
          }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "apiVersion: apps.open-cluster-management.io/v1\nkind: PlacementRule\nmetadata:\n  name: mortgage-app-placement\n  namespace: default\n  generation: 2\n  labels:\n    app: mortgage-app-mortgage\nspec:\n  clusterLabels:\n    matchLabels:\n      environment: Dev\n  clusterReplicas: 4\n";
    const row = 33;
    const result = {
      apiVersion: { $r: 33, $v: "apps.open-cluster-management.io/v1" },
      kind: { $r: 34, $v: "PlacementRule" },
      metadata: {
        $r: 35,
        $v: {
          generation: { $r: 38, $v: 2 },
          labels: {
            $r: 39,
            $v: { app: { $r: 40, $v: "mortgage-app-mortgage" } }
          },
          name: { $r: 36, $v: "mortgage-app-placement" },
          namespace: { $r: 37, $v: "default" }
        }
      },
      spec: {
        $r: 41,
        $v: {
          clusterLabels: {
            $r: 42,
            $v: {
              matchLabels: {
                $r: 43,
                $v: { environment: { $r: 44, $v: "Dev" } }
              }
            }
          },
          clusterReplicas: { $r: 45, $v: 4 }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "apiVersion: apps.open-cluster-management.io/v1\nkind: Deployable\nmetadata:\n  name: mortgage--mortgage-app-deploy-deployment\n  namespace: mortgage-ch\n  generation: 1\n  labels:\n    apps.open-cluster-management.io/channel: mortgage-channel\n    apps.open-cluster-management.io/channel-type: GitHub\n  ownerReferences:\n    - name: mortgage-channel\n      apiVersion: apps.open-cluster-management.io/v1\n      blockOwnerDeletion: true\n      controller: true\n      kind: Channel\nspec:\n  template:\n    apiVersion: apps/v1\n    kind: Deployment\n    metadata:\n      name: mortgage-app-deploy\n      labels:\n        app: mortgage-app-mortgage\n    spec:\n      replicas: 1\n      selector:\n        matchLabels:\n          app: mortgage-app-mortgage\n      template:\n        metadata:\n          labels:\n            app: mortgage-app-mortgage\n        spec:\n          containers:\n            - name: mortgage-app-mortgage\n              image: 'fxiang/mortgage:0.4.0'\n              imagePullPolicy: Always\n              ports:\n                - containerPort: 9080\n              resources:\n                limits:\n                  cpu: 200m\n                  memory: 256Mi\n                request:\n                  cpu: 200m\n                  memory: 256Mi\n";
    const row = 47;
    const result = {
      apiVersion: { $r: 47, $v: "apps.open-cluster-management.io/v1" },
      kind: { $r: 48, $v: "Deployable" },
      metadata: {
        $r: 49,
        $v: {
          name: { $r: 50, $v: "mortgage--mortgage-app-deploy-deployment" },
          namespace: { $r: 51, $v: "mortgage-ch" },
          generation: { $r: 52, $v: 1 },
          labels: {
            $r: 53,
            $v: {
              "apps.open-cluster-management.io/channel": {
                $r: 54,
                $v: "mortgage-channel"
              },
              "apps.open-cluster-management.io/channel-type": {
                $r: 55,
                $v: "GitHub"
              }
            }
          },
          ownerReferences: {
            $r: 56,
            $v: [
              {
                $r: 57,
                $v: {
                  name: { $r: 57, $v: "mortgage-channel" },
                  apiVersion: {
                    $r: 58,
                    $v: "apps.open-cluster-management.io/v1"
                  },
                  blockOwnerDeletion: { $r: 59, $v: true },
                  controller: { $r: 60, $v: true },
                  kind: { $r: 61, $v: "Channel" }
                }
              }
            ]
          }
        }
      },
      spec: {
        $r: 62,
        $v: {
          template: {
            $r: 63,
            $v: {
              apiVersion: { $r: 64, $v: "apps/v1" },
              kind: { $r: 65, $v: "Deployment" },
              metadata: {
                $r: 66,
                $v: {
                  name: { $r: 67, $v: "mortgage-app-deploy" },
                  labels: {
                    $r: 68,
                    $v: { app: { $r: 69, $v: "mortgage-app-mortgage" } }
                  }
                }
              },
              spec: {
                $r: 70,
                $v: {
                  replicas: { $r: 71, $v: 1 },
                  selector: {
                    $r: 72,
                    $v: {
                      matchLabels: {
                        $r: 73,
                        $v: { app: { $r: 74, $v: "mortgage-app-mortgage" } }
                      }
                    }
                  },
                  template: {
                    $r: 75,
                    $v: {
                      metadata: {
                        $r: 76,
                        $v: {
                          labels: {
                            $r: 77,
                            $v: { app: { $r: 78, $v: "mortgage-app-mortgage" } }
                          }
                        }
                      },
                      spec: {
                        $r: 79,
                        $v: {
                          containers: {
                            $r: 80,
                            $v: [
                              {
                                $r: 81,
                                $v: {
                                  name: { $r: 81, $v: "mortgage-app-mortgage" },
                                  image: {
                                    $r: 82,
                                    $v: "fxiang/mortgage:0.4.0"
                                  },
                                  imagePullPolicy: { $r: 83, $v: "Always" },
                                  ports: {
                                    $r: 84,
                                    $v: [
                                      {
                                        $r: 85,
                                        $v: {
                                          containerPort: { $r: 85, $v: 9080 }
                                        }
                                      }
                                    ]
                                  },
                                  resources: {
                                    $r: 86,
                                    $v: {
                                      limits: {
                                        $r: 87,
                                        $v: {
                                          cpu: { $r: 88, $v: "200m" },
                                          memory: { $r: 89, $v: "256Mi" }
                                        }
                                      },
                                      request: {
                                        $r: 90,
                                        $v: {
                                          cpu: { $r: 91, $v: "200m" },
                                          memory: { $r: 92, $v: "256Mi" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mortgage-app-deploy\n  labels:\n    app: mortgage-app-mortgage\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: mortgage-app-mortgage\n  template:\n    metadata:\n      labels:\n        app: mortgage-app-mortgage\n    spec:\n      containers:\n        - name: mortgage-app-mortgage\n          image: 'fxiang/mortgage:0.4.0'\n          imagePullPolicy: Always\n          ports:\n            - containerPort: 9080\n          resources:\n            limits:\n              cpu: 200m\n              memory: 256Mi\n            request:\n              cpu: 200m\n              memory: 256Mi\n";
    const row = 94;
    const result = {
      apiVersion: { $r: 94, $v: "apps/v1" },
      kind: { $r: 95, $v: "Deployment" },
      metadata: {
        $r: 96,
        $v: {
          name: { $r: 97, $v: "mortgage-app-deploy" },
          labels: {
            $r: 98,
            $v: { app: { $r: 99, $v: "mortgage-app-mortgage" } }
          }
        }
      },
      spec: {
        $r: 100,
        $v: {
          replicas: { $r: 101, $v: 1 },
          selector: {
            $r: 102,
            $v: {
              matchLabels: {
                $r: 103,
                $v: { app: { $r: 104, $v: "mortgage-app-mortgage" } }
              }
            }
          },
          template: {
            $r: 105,
            $v: {
              metadata: {
                $r: 106,
                $v: {
                  labels: {
                    $r: 107,
                    $v: { app: { $r: 108, $v: "mortgage-app-mortgage" } }
                  }
                }
              },
              spec: {
                $r: 109,
                $v: {
                  containers: {
                    $r: 110,
                    $v: [
                      {
                        $r: 111,
                        $v: {
                          name: { $r: 111, $v: "mortgage-app-mortgage" },
                          image: { $r: 112, $v: "fxiang/mortgage:0.4.0" },
                          imagePullPolicy: { $r: 113, $v: "Always" },
                          ports: {
                            $r: 114,
                            $v: [
                              {
                                $r: 115,
                                $v: { containerPort: { $r: 115, $v: 9080 } }
                              }
                            ]
                          },
                          resources: {
                            $r: 116,
                            $v: {
                              limits: {
                                $r: 117,
                                $v: {
                                  cpu: { $r: 118, $v: "200m" },
                                  memory: { $r: 119, $v: "256Mi" }
                                }
                              },
                              request: {
                                $r: 120,
                                $v: {
                                  cpu: { $r: 121, $v: "200m" },
                                  memory: { $r: 122, $v: "256Mi" }
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "- port: 9080 #194\n  protocol: TCP #195\n  targetPort: 9080 #196";
    const row = undefined;
    const result = [
      {
        $r: 0,
        $v: {
          port: { $cmt: "194", $r: 0, $v: 9080 },
          protocol: { $cmt: "195", $r: 1, $v: "TCP" },
          targetPort: { $cmt: "196", $r: 2, $v: 9080 }
        }
      }
    ];
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });

  it("output", () => {
    const value =
      "apiVersion: v1\nkind: Service\nmetadata:\n  name: mortgage-app-svc\n  labels:\n    app: mortgage-app-mortgage\nspec:\n  ports:\n    - port: 9080\n      protocol: TCP\n      targetPort: 9080\n  selector:\n    app: mortgage-app-mortgage\n  type: NodePort\n";
    const row = 186;
    const result = {
      apiVersion: { $r: 186, $v: "v1" },
      kind: { $r: 187, $v: "Service" },
      metadata: {
        $r: 188,
        $v: {
          labels: {
            $r: 190,
            $v: { app: { $r: 191, $v: "mortgage-app-mortgage" } }
          },
          name: { $r: 189, $v: "mortgage-app-svc" }
        }
      },
      spec: {
        $r: 192,
        $v: {
          ports: {
            $r: 193,
            $v: [
              {
                $r: 194,
                $v: {
                  port: { $r: 194, $v: 9080 },
                  protocol: { $r: 195, $v: "TCP" },
                  targetPort: { $r: 196, $v: 9080 }
                }
              }
            ]
          },
          selector: {
            $r: 197,
            $v: { app: { $r: 198, $v: "mortgage-app-mortgage" } }
          },
          type: { $r: 199, $v: "NodePort" }
        }
      }
    };
    const output = new YamlParser().parse(value, row);
    expect(output).toEqual(result);
  });
});
