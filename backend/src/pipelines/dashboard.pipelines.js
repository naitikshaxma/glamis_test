export const SvarPipeline = (user) => [
  {
    $match: {
      user: user._id
    }
  },
  {
    $lookup: {
      from: "interviews",
      localField: "interview_taken",
      foreignField: "_id",
      as: "interview"
    }
  },
  {
    $project: {
      interview: 1,
      _id: 0
    }
  },
  {
    $unwind: "$interview"
  },
  {
    $match: {
      "interview.type": "Svar",
      "interview.is_active": false
    }
  },
  {
    $sort: {
      "interview.createdAt": -1
    }
  },
  {
    $limit: 5
  },
  {
    $sort: {
      "interview.createdAt": 1
    }
  },
  {
    $lookup: {
      from: "adminsvarinterviews",
      localField: "interview._id",
      foreignField: "interview",
      as: "adminInterview"
    }
  },
  {
    $addFields: {
      adminInterview: {
        $first: "$adminInterview"
      }
    }
  },
  {
    $addFields: {
      Title: "$interview.title",
      QuestionCounts: [
        "$adminInterview.reading",
        "$adminInterview.repeating",
        "$adminInterview.short",
        "$adminInterview.jumbled",
        "$adminInterview.comprehension"
      ]
    }
  },
  {
    $lookup: {
      from: "interviewquestions",
      localField: "interview._id",
      foreignField: "interview",
      as: "Questions"
    }
  },
  {
    $addFields: {
      Reading: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $first: "$QuestionCounts"
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Repeating: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $add: [
                    {
                      $first: "$QuestionCounts"
                    }
                  ]
                },
                {
                  $arrayElemAt: [
                    "$QuestionCounts",
                    1
                  ]
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Short: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $add: [
                    {
                      $first: "$QuestionCounts"
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        1
                      ]
                    }
                  ]
                },
                {
                  $arrayElemAt: [
                    "$QuestionCounts",
                    2
                  ]
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Jumbled: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $add: [
                    {
                      $first: "$QuestionCounts"
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        1
                      ]
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        2
                      ]
                    }
                  ]
                },
                {
                  $arrayElemAt: [
                    "$QuestionCounts",
                    3
                  ]
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Comprehension: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $add: [
                    {
                      $first: "$QuestionCounts"
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        1
                      ]
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        2
                      ]
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        3
                      ]
                    }
                  ]
                },
                {
                  $arrayElemAt: [
                    "$QuestionCounts",
                    4
                  ]
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      }
    }
  },
  {
    $addFields: {
      Grammar: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.grammar"
          }
        }
      },
      OverallPerformance: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Pronounciation: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.pronounciation"
          }
        }
      },
      Correctness: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.correctness"
          }
        }
      }
    }
  },
  {
    $project: {
      Title: 1,
      Reading: 1,
      Repeating: 1,
      Short: 1,
      Jumbled: 1,
      Comprehension: 1,
      Grammar: 1,
      OverallPerformance: 1,
      Pronounciation: 1,
      Correctness: 1
    }
  }
]


export const WrittenPipeline = (user) => [
  {
    $match: {
      user: user._id
    }
  },
  {
    $lookup: {
      from: "interviews",
      localField: "interview_taken",
      foreignField: "_id",
      as: "interview"
    }
  },
  {
    $project: {
      interview: 1,
      _id: 0
    }
  },
  {
    $unwind: "$interview"
  },
  {
    $match: {
      "interview.type": "written",
      "interview.is_active": false
    }
  },
  {
    $sort: {
      "interview.createdAt": -1
    }
  },
  {
    $limit: 5
  },
  {
    $sort: {
      "interview.createdAt": 1
    }
  },
  {
    $lookup: {
      from: "adminwritteninterviews",
      localField: "interview._id",
      foreignField: "interview",
      as: "adminInterview"
    }
  },
  {
    $addFields: {
      adminInterview: {
        $first: "$adminInterview"
      }
    }
  },
  {
    $addFields: {
      Title: "$interview.title",
      QuestionCounts: [
        "$adminInterview.essay",
        "$adminInterview.jumbled",
        "$adminInterview.errorDetection",
      ]
    }
  },
  {
    $lookup: {
      from: "interviewquestions",
      localField: "interview._id",
      foreignField: "interview",
      as: "Questions"
    }
  },
  {
    $addFields: {
      Essay: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $first: "$QuestionCounts"
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Jumbled: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $add: [
                    {
                      $first: "$QuestionCounts"
                    }
                  ]
                },
                {
                  $arrayElemAt: [
                    "$QuestionCounts",
                    1
                  ]
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      ErrorDetection: {
        $avg: {
          $map: {
            input: {
              $slice: [
                "$Questions",
                {
                  $add: [
                    {
                      $first: "$QuestionCounts"
                    },
                    {
                      $arrayElemAt: [
                        "$QuestionCounts",
                        1
                      ]
                    }
                  ]
                },
                {
                  $arrayElemAt: [
                    "$QuestionCounts",
                    2
                  ]
                }
              ]
            },
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
    }
  },
  {
    $addFields: {
      Grammar: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.grammar"
          }
        }
      },
      OverallPerformance: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.overallPerformance"
          }
        }
      },
      Vocabulary: {
        $avg: {
          $map: {
            input: "$Questions",
            as: "item",
            in: "$$item.vocabulary"
          }
        }
      },
    }
  },
  {
    $project: {
      Title: 1,
      Essay: 1,
      Jumbled: 1,
      ErrorDetection: 1,
      Grammar: 1,
      OverallPerformance: 1,
      Vocabulary: 1
    }
  }
]
