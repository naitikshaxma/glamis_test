import React from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { ResponsiveContainer } from 'recharts';
import { Written, WrittenCard } from '../components/detailed_report/Written';


const WrittenReport = () => {
    const data = {
        "prompt": "Consider the role of video games in shaping collective memory and cultural identity. How do specific games reflect or challenge social norms, historical narratives, or personal experiences? Analyze a particular game or genre and discuss its impact on players’ perceptions of reality, community, or self. What insights can this provide regarding the evolving relationship between gaming and societal values?",
        "userEssay": "Video games play a significant role in shaping collective memory and cultural identity by reflecting or challenging social norms, historical narratives, and personal experiences. *Assassin’s Creed* is a notable example, blending historical events with fictional narratives to engage players with different eras and cultural contexts. By immersing players in historical settings—such as Renaissance Italy or Revolutionary America—the game series provides a reimagined view of history, making it accessible and engaging while influencing players’ perceptions of historical events and cultural identities.\n\nFor instance, *Assassin’s Creed III* reinterprets the American Revolution, presenting a narrative that includes Native American perspectives often overlooked in mainstream history. This approach challenges dominant historical narratives and encourages players to reconsider historical events from multiple viewpoints.\n\nThe impact on players is profound, as such games offer a form of historical engagement that combines education with entertainment, shaping how individuals and communities understand and relate to their past. By interacting with these narratives, players develop a nuanced view of historical and cultural identities, reflecting evolving societal values and the growing role of gaming in cultural discourse.",
        "overallScore": 90,
        "grammarScore": 85,
        "vocabularyScore": 88,
        "contentScore": 92,
        "structureScore": 87,
        "contentExplanation": {
            "Pros": "Strong analysis of game content\nHighlights diverse perspectives\nConnects gaming with cultural impact",
            "Cons": "Could include more examples\nLacks deeper engagement with identity\nMore discussion on societal values needed"
        },
        "vocabularyExplanation": {
            "Pros": "Varied and appropriate vocabulary\nEffective use of terms like 'nuanced'\nEngaging language enhances readability",
            "Cons": "Some phrases could be simplified\nAvoid overly complex terminology\nCould use more technical terms"
        },
        "grammarExplanation": {
            "Pros": "Generally strong grammatical structure\nEffective sentence variation\nCorrect use of punctuation",
            "Cons": "Few awkward sentence constructions\nMinor typographical errors\nConsistency with tense usage needed"
        },
        "structureExplanation": {
            "Pros": "Clear introduction and conclusion\nLogical flow of ideas\nWell-defined paragraphs enhance readability",
            "Cons": "Transition between paragraphs could improve\nSome ideas feel rushed\nMore elaboration on key points needed"
        },
        "expectedEssay": "Video games significantly contribute to shaping collective memory and cultural identity by reflecting and challenging social norms, historical narratives, and personal experiences. A prime example is the *Assassin's Creed* series, which melds real historical events with creative storytelling to immerse players in various cultural contexts. For instance, *Assassin's Creed III* offers a fresh perspective on the American Revolution by including Native American viewpoints, prompting players to reconsider established narratives. The series not only educates players about historical contexts but also influences their understanding of cultural identities. This interaction fosters a more nuanced perception of history among players, demonstrating how gaming can reshape societal views and values. The evolving relationship between gaming and societal norms highlights the potential of video games as mediums for cultural reflection and identity formation."
    };

    const chartData = [
        { name: 'Overall', score: data.overallScore },
        { name: 'Grammar', score: data.grammarScore },
        { name: 'Vocabulary', score: data.vocabularyScore },
        { name: 'Content', score: data.contentScore },
        { name: 'Structure', score: data.structureScore }
    ];

    return (
        <>
            <Written data={chartData} />
            <WrittenCard {...data} />
        </>
    );
}

export default WrittenReport;