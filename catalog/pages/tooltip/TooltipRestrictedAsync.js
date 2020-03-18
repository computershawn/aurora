/* eslint-disable react/no-multi-comp */
import React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import SeatMapTooltip from "../../../src/components/Tooltip/SeatMapTooltip";
import { LinkCta } from "../../../src/components/Text";
import { TRANSPARENT } from "../../../src/components/constants";

const Container = styled.div`
  height: auto;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

const TooltipButton = styled.div`
  display: inline-block;
`;

const bigContent = `Ut lectus arcu bibendum at varius vel. Vitae nunc sed velit dignissim sodales ut eu sem. 
  Velit sed ullamcorper morbi tincidunt ornare massa. Praesent elementum facilisis leo vel 
  fringilla est ullamcorper eget. Mauris commodo quis imperdiet massa tincidunt nunc. Tellus
  in hac habitasse platea dictumst vestibulum rhoncus. Et odio pellentesque diam volutpat. 
  Sed id semper risus in. Ut venenatis tellus in metus vulputate eu. Vitae auctor eu augue ut
  lectus.`;

class AsyncContent extends React.Component {
  state = {
    content: "loading..."
  };

  componentDidMount() {
    this.timeoutId = setTimeout(() => {
      this.setState(state => ({ ...state, content: bigContent }));
      this.props.onLoad();
    }, 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  render() {
    const { content } = this.state;

    return <div>{content}</div>;
  }
}

AsyncContent.propTypes = {
  onLoad: PropTypes.func
};

AsyncContent.defaultProps = {
  onLoad: () => {}
};

const seatMap = new Array(34).fill(1);
const seatMapStyle = {
  display: "inline-block",
  width: "20px",
  height: "20px",
  backgroundColor: "#026CDF",
  border: "2px solid #000",
  borderRadius: "20px",
  margin: "2px",
  color: TRANSPARENT
};

class TooltipRestrictedAsyncDemo extends React.Component {
  state = {
    isOpened: false
  };

  onDirectionChanged = direction => {
    console.log("onDirectionChanged", direction);
  };

  hideTooltip = () => {
    this.setState(state => ({ ...state, isOpened: false }));
  };

  showTooltip = (e, preferTop = false) => {
    const rect = e.target.getBoundingClientRect();

    const position = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };

    this.setState(state => ({ ...state, isOpened: true, position, preferTop }));
    this.tooltipRef.current.refresh();
  };

  tooltipRef = React.createRef();

  render() {
    const { isOpened, position, preferTop } = this.state;

    return (
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <TooltipButton>
            <LinkCta
              onMouseEnter={this.showTooltip}
              onMouseLeave={this.hideTooltip}
            >
              Hover for Async Tooltip - Bottom (default)
            </LinkCta>
          </TooltipButton>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <TooltipButton>
            <LinkCta
              onMouseEnter={e => {
                this.showTooltip(e, true);
              }}
              onMouseLeave={this.hideTooltip}
            >
              Hover for Async Tooltip - Top
            </LinkCta>
          </TooltipButton>
        </div>

        <br />
        <br />

        <h3>SeatMap Test</h3>

        <div>
          {seatMap.map((i, index) => (
            <TooltipButton key={`key-${index + 2}`}>
              <LinkCta
                onMouseEnter={e => {
                  this.showTooltip(e, true);
                }}
                onMouseLeave={this.hideTooltip}
                style={seatMapStyle}
              >
                {i}
              </LinkCta>
            </TooltipButton>
          ))}
        </div>

        <SeatMapTooltip
          ref={this.tooltipRef}
          isVisible={isOpened}
          position={{ ...position }}
          preferTop={preferTop}
          directionChanged={this.onDirectionChanged}
        >
          {isOpened ? (
            <AsyncContent onLoad={() => this.tooltipRef.current.refresh()} />
          ) : (
            ""
          )}
        </SeatMapTooltip>
      </Container>
    );
  }
}

export default TooltipRestrictedAsyncDemo;
