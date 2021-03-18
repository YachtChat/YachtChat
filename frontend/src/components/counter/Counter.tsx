import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
} from '../../store/counterSlice';
import styles from './Counter.module.scss';
import {RootState} from "../../store/store";

interface Props {
  increment: () => void
  decrease: () => void
  incrementAsync: (amount: number) => void
  increaseByAmount: (amount: number) => void
  count: number
  incrementAmount: number
}

export class Counter extends Component<Props> {


  render() {
    return (
        <div>
          <div className={styles.row}>
            <button
                className={styles.button}
                aria-label="Increment value"
                onClick={() => this.props.increment()}
            >
              +
            </button>
            <span className={styles.value}>{this.props.count}</span>
            <button
                className={styles.button}
                aria-label="Decrement value"
                onClick={() => this.props.decrease()}
            >
              -
            </button>
          </div>
          <div className={styles.row}>
            <input
                className={styles.textbox}
                aria-label="Set increment amount"
                value={this.props.incrementAmount}
                onChange={e => this.props.increaseByAmount(Number(e.target.value))}
            />
            <button
                className={styles.button}
                onClick={() =>
                    this.props.increaseByAmount(Number(this.props.incrementAmount) || 0)
                }
            >
              Add Amount
            </button>
            <button
                className={styles.asyncButton}
                onClick={() => this.props.incrementAsync(Number(this.props.incrementAmount) || 0)}
            >
              Add Async
            </button>
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  count: state.counter.value,
  incrementAmount: state.counter.incrementAmount
})

const mapDispatchToProps = (dispatch: any) => ({
  increment: () => dispatch(increment()),
  decrease: () => dispatch(decrement()),
  incrementAsync: (amount: number) => dispatch(incrementAsync(amount)),
  increaseByAmount: (amount: number) => dispatch(incrementByAmount(amount))
})

export default connect(mapStateToProps, mapDispatchToProps)(Counter)