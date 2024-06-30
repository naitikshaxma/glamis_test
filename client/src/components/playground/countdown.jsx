import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const UrgeWithPleasureComponent = () => (
  <CountdownCircleTimer
    isPlaying
    duration={7}
    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
    colorsTime={[7, 5, 2, 0]}
    size={90}
  >
    {({ remainingTime }) => remainingTime}
  </CountdownCircleTimer>
)

export default UrgeWithPleasureComponent;