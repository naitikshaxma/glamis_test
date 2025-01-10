import e from "express"

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
      Repeating: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 1] }, 0] }, then: 0, else: {
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
      } } },
      Short: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 2] }, 0] }, then: 0, else: {
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
      } } },
      Jumbled: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 3] }, 0] }, then: 0, else: {
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
      } } },
      Comprehension: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 4] }, 0] }, then: 0, else: {
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
      } } }
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
      Essay: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 0] }, 0] }, then: 0, else: {
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
      } } },
      Jumbled: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 1] }, 0] }, then: 0, else: {
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
      } } },
      ErrorDetection: { $cond: { if: { $eq: [{ $arrayElemAt: ["$QuestionCounts", 2] }, 0] }, then: 0, else: {
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
      } } }
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


// --------- Company Pipeline --------------//

export const CompanyPipeline = (user)=> [
  {
    $match:{
      user:user._id
    }
  },
  {
    $lookup:{
      from:"interviews",
      localField:"interview_taken",
      foreignField:"_id",
      as:"interview_s"
    }
  },
  {
    $project:{
      interview_s:1,
      _id:0
    }
  },
  {
    $unwind:"$interview_s"
  },
  {
    $match:{
      "interview_s.type":"company",
      "interview_s.is_active":false
    }
  },
  {
    $addFields:{
      createdAt:"$interview_s.createdAt"
    }
  },
  {
    $lookup:{
      from:"interviewquestions",
      localField:"interview_s._id",
      foreignField:"interview",
      as:"questions"
    }
  },
  {
    $unwind:"$questions"
  },
  {
    $group:{
      _id:"$questions.interview",
      performance:{$sum:"$questions.overallPerformance"},
      vocabulary:{$sum:"$questions.vocabulary"},
      grammar:{$sum:"$questions.grammar"},
      questionCount:{$sum:1},
      createdAt:{$first:"$createdAt"},
      questions:{$push:"$questions"}
    }
  },
  {
    $lookup:{
      from:"admincompanyinterviews",
      let: { interviewId: "$_id" }, 
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$$interviewId", { $ifNull: ["$interview", []] }] },
          }
        }
      ],
      as: "adminInterview"
    }
  },
  {
    $unwind:"$adminInterview"
  },
  {
    $addFields: {
      company: "$adminInterview.company",
      easy: { $ifNull: ["$adminInterview.easy_remaining", 0] },
      medium: { $ifNull: ["$adminInterview.medium_remaining", 0] },
      hard: { $ifNull: ["$adminInterview.hard_remaining", 0] }
    }
  },
  {
    $addFields: {
      easyQuestions: {
        $cond: [
          { $gt: ["$easy", 0] },
          { $slice: ["$questions", 0, "$easy"] },
          []
        ]
      },
      mediumQuestions: {
        $cond: [
          { $gt: ["$medium", 0] },
          { $slice: ["$questions", "$easy", "$medium"] },
          []
        ]
      },
      hardQuestions: {
        $cond: [
          { $gt: ["$hard", 0] },
          {
            $slice: [
              "$questions",
              { $subtract: [{ $size: "$questions" }, "$hard"] },
              "$hard"
            ]
          },
          []
        ]
      }
    }
  },
  {
    $addFields: {
      easyAvgPerformance: {
        $cond: [
          { $gt: [{ $size: "$easyQuestions" }, 0] },
          {
            $divide: [
              {
                $reduce: {
                  input: "$easyQuestions.overallPerformance",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this"] }
                }
              },
              { $size: "$easyQuestions" }
            ]
          },
          0
        ]
      },
      mediumAvgPerformance: {
        $cond: [
          { $gt: [{ $size: "$mediumQuestions" }, 0] },
          {
            $divide: [
              {
                $reduce: {
                  input: "$mediumQuestions.overallPerformance",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this"] }
                }
              },
              { $size: "$mediumQuestions" }
            ]
          },
          0
        ]
      },
      hardAvgPerformance: {
        $cond: [
          { $gt: [{ $size: "$hardQuestions" }, 0] },
          {
            $divide: [
              {
                $reduce: {
                  input: "$hardQuestions.overallPerformance",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this"] }
                }
              },
              { $size: "$hardQuestions" }
            ]
          },
          0
        ]
      }
    }
  },
  {
    $project:{
      company:1,
      performance:{
        $cond:[
          {$ne:["$questionCount",0]},
          {$divide:["$performance","$questionCount"]},
          0
        ]
      },
      vocabulary:{
        $cond:[
          {$ne:["$questionCount",0]},
          {$divide:["$vocabulary","$questionCount"]},
          0
        ]
      },
      createdAt:1,
      grammar:{
        $cond:[
          {$ne:["$questionCount",0]},
          {$divide:["$grammar","$questionCount"]},
          0
        ]
      },
      easyAvgPerformance: 1,
      mediumAvgPerformance: 1,
      hardAvgPerformance: 1,
    }
  },
  {
    $sort:{"createdAt":-1}
  }
]
export const SubjectPipeline = (user)=> [
  {
    $match:{
      user:user._id
    }
  },
  {
    $lookup:{
      from:"interviews",
      localField:"interview_taken",
      foreignField:"_id",
      as:"interview_s"
    }
  },
  {
    $project:{
      interview_s:1,
      _id:0
    }
  },
  {
    $unwind:"$interview_s"
  },
  {
    $match:{
      "interview_s.type":"subject",
      "interview_s.is_active":false
    }
  },
  {
    $addFields:{
      createdAt:"$interview_s.createdAt"
    }
  },
  {
    $lookup:{
      from:"interviewquestions",
      localField:"interview_s._id",
      foreignField:"interview",
      as:"questions"
    }
  },
  {
    $unwind:"$questions"
  },
  {
    $group:{
      _id:"$questions.interview",
      performance:{$sum:"$questions.overallPerformance"},
      vocabulary:{$sum:"$questions.vocabulary"},
      grammar:{$sum:"$questions.grammar"},
      questionCount:{$sum:1},
      createdAt:{$first:"$createdAt"},
      questions:{$push:"$questions"}
    }
  },
  {
    $lookup:{
      from:"adminsubjectinterviews",
      let: { interviewId: "$_id" }, 
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$$interviewId", { $ifNull: ["$interview", []] }] },
          }
        }
      ],
      as: "adminInterview"
    }
  },
  {
    $unwind:"$adminInterview"
  },
  {
    $addFields: {
      company: "$adminInterview.subject",
      easy: { $ifNull: ["$adminInterview.easy", 0] },
      medium: { $ifNull: ["$adminInterview.medium", 0] },
      hard: { $ifNull: ["$adminInterview.hard", 0] }
    }
  },
  {
    $addFields: {
      easyQuestions: {
        $cond: [
          { $gt: ["$easy", 0] },
          { $slice: ["$questions", 0, "$easy"] },
          []
        ]
      },
      mediumQuestions: {
        $cond: [
          { $gt: ["$medium", 0] },
          { $slice: ["$questions", "$easy", "$medium"] },
          []
        ]
      },
      hardQuestions: {
        $cond: [
          { $gt: ["$hard", 0] },
          {
            $slice: [
              "$questions",
              { $subtract: [{ $size: "$questions" }, "$hard"] },
              "$hard"
            ]
          },
          []
        ]
      }
    }
  },
  {
    $addFields: {
      easyAvgPerformance: {
        $cond: [
          { $gt: [{ $size: "$easyQuestions" }, 0] },
          {
            $divide: [
              {
                $reduce: {
                  input: "$easyQuestions.overallPerformance",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this"] }
                }
              },
              { $size: "$easyQuestions" }
            ]
          },
          0
        ]
      },
      mediumAvgPerformance: {
        $cond: [
          { $gt: [{ $size: "$mediumQuestions" }, 0] },
          {
            $divide: [
              {
                $reduce: {
                  input: "$mediumQuestions.overallPerformance",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this"] }
                }
              },
              { $size: "$mediumQuestions" }
            ]
          },
          0
        ]
      },
      hardAvgPerformance: {
        $cond: [
          { $gt: [{ $size: "$hardQuestions" }, 0] },
          {
            $divide: [
              {
                $reduce: {
                  input: "$hardQuestions.overallPerformance",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this"] }
                }
              },
              { $size: "$hardQuestions" }
            ]
          },
          0
        ]
      }
    }
  },
  {
    $project:{
      company:1,
      performance:{
        $cond:[
          {$ne:["$questionCount",0]},
          {$divide:["$performance","$questionCount"]},
          0
        ]
      },
      vocabulary:{
        $cond:[
          {$ne:["$questionCount",0]},
          {$divide:["$vocabulary","$questionCount"]},
          0
        ]
      },
      createdAt:1,
      grammar:{
        $cond:[
          {$ne:["$questionCount",0]},
          {$divide:["$grammar","$questionCount"]},
          0
        ]
      },
      easyAvgPerformance: 1,
      mediumAvgPerformance: 1,
      hardAvgPerformance: 1,
    }
  },
  {
    $sort:{"createdAt":-1}
  }
]