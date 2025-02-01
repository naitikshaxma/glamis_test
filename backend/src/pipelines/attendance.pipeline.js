export const attendancePipeline = (interviews) => [
  {
    $match: {
      _id: {$in: interviews}
    }
  },
  {
    $project: {
      interviewId: "$_id",
      is_active: 1,
      attemptedQuestions: 1,
      tabSwitchCount: 1
    }
  },
  // Stage 3: Lookup in students collection using interviewId
  {
    $lookup: {
      from: "students",
      let: {
        interviewId: "$interviewId"
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: [
                "$$interviewId",
                {
                  $ifNull: [
                    "$interview_taken",
                    []
                  ]
                }
              ]
            }
          }
        }
      ],
      as: "matched_students"
    }
  },
  // Stage 4: Unwind the matched_students array
  {
    $unwind: "$matched_students"
  },
  // Stage 5: Project the user_id from matched students, and keep interviewId
  {
    $project: {
      user_id: "$matched_students.user",
      // Student's user ID
      is_active: 1,
      attemptedQuestions: 1,
      tabSwitchCount: 1,
      interviewId: 1 // Retain interview ID

    }
  },
  // Stage 6: Lookup in users collection using user_id
  {
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user_data"
    }
  },
  // Stage 7: Unwind the user_data array
  {
    $unwind: "$user_data"
  },
  // Stage 8: Project email, name, and other fields, including interviewId
  {
    $project: {
      email: "$user_data.email_id",
      name: "$user_data.name",
      userId: "$user_data._id",
      is_active: 1,
      attemptedQuestions: 1,
      tabSwitchCount: 1,
      interviewId: 1 // Retain interview ID for next lookup
    }
  },
  // Stage 9: Lookup in interviewQuestion collection for scores
  {
    $lookup: {
      from: "interviewquestions",
      localField: "interviewId",
      // Match using preserved interview ID
      foreignField: "interview",
      // Match with interview field in interviewquestions
      as: "questions"
    }
  },
  // Stage 10: Add total and average score fields
  {
    $addFields: {
      totalScore: {
        $sum: "$questions.overallPerformance"
      },
      averageScore: {
        $cond: [
          {
            $gt: [
              {
                $size: "$questions"
              },
              0
            ]
          },
          {
            $avg: "$questions.overallPerformance"
          },
          0
        ]
      },
      viewReport: {
        $concat: [
          "http://glamis.in/history/detailed/",
          {
            $toString: "$interviewId"
          }
        ]
      },
      grammar: {
        $cond: [
          {
            $gt: [
              {
                $size: "$questions"
              },
              0
            ]
          },
          {
            $avg: "$questions.grammar"
          }, 0
        ]
      }
    }
  },
  // Stage 11: Group results with the new fields
  {
    $group: {
      _id: null,
      emails: {
        $push: {
          Email: "$email",
          Name: "$name",
          UserId: "$userId",
          InterviewId: "$interviewId",
          Present: {
            $not: "$is_active"
          },
          AttemptedQuestions: "$attemptedQuestions",
          TabSwitches: "$tabSwitchCount",
          TechnicalScore: "$totalScore",
          AverageScore: "$averageScore",
          View_Report: "$viewReport",
          GrammarScore: "$grammar"
        }
      },
      total_count: {
        $sum: 1
      }
    }
  }
]
