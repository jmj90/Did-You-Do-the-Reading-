import React from 'react'
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';
import { Container } from 'semantic-ui-react'



export default function SingleStudentGraph(props){
  const data = props.data

  const studentId = props.studentId


  return (
    <Container>
    <h1 className="graph-title">Scores for Student #{studentId}</h1>
      {
        data.length > 1 ?
        <VictoryChart
        domainPadding={20}
        theme={VictoryTheme.grayscale}
        >
          <VictoryAxis label="days"
            tickValues={[43, 44, 45, 46, 47]}/>
          <VictoryAxis dependentAxis
            tickValues={[50, 60, 70, 80, 90, 100]} />
          <VictoryLine
          data={data}
          x="date"
          y="score"
          />
        </VictoryChart>
        : <h2>not enough data to show a graph for this student</h2>
      }

    </Container>
  )
}