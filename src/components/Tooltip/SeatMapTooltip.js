import React, { Component } from "react";
import PropTypes from "prop-types";
import { CSSTransition } from "react-transition-group";
import Portal from "../PopOver/PopOverPortal";
import { StyledTooltip } from "./Tooltip.styles";
import SPACE_FROM_MOUSE from "./constants";
import { TOP, BOTTOM, VARIANTS, LIGHT, ARROW_WIDTH } from "../constants";
import { constants } from "../../theme";

class SeatMapTooltip extends Component {
  constructor(props) {
    super(props);

    this.myRef = React.createRef();

    this.dimensions = {
      width: 0,
      height: 0,
      windowScroll: 0,
      windowWidth: 0,
      windowHeight: 0
    };

    this.pos = {
      x: 0,
      y: 0
    };

    this.state = {
      actualDirection: this.props.preferTop ? TOP : BOTTOM,
      arrowAdjustment: 0
    };
  }

  componentDidMount() {
    this.refresh();
  }

  /*
   * If any specific value is passed via `direction` props, than that value should be used
   * If `auto` value is passed via `direction` prop, then calculated direction value will be used
   */
  getDirection = () => {
    const { actualDirection } = this.state;
    return actualDirection;
  };

  getPositionAndUpdateDirection = ({
    position,
    dimensions,
    spaceFromMouse
  }) => {
    const result = this.getTooltipPosition({
      position,
      dimensions,
      spaceFromMouse
    });

    let direction = this.props.preferTop ? TOP : BOTTOM;

    if (result.y < position.y + dimensions.windowScroll) {
      direction = TOP;
    } else if (result.y > position.y + dimensions.windowScroll) {
      direction = BOTTOM;
    }

    this.setState((prevState, props) => {
      const { directionChanged } = props;
      const { actualDirection } = prevState;

      if (actualDirection !== direction) {
        if (direction && directionChanged) {
          directionChanged(direction);
        }

        return {
          actualDirection: direction || actualDirection
        };
      }

      return null;
    });

    return result;
  };

  getTooltipPosition = ({ position, dimensions }) => {
    const { preferTop, spaceFromMouse } = this.props;

    const {
      width,
      windowScroll,
      height,
      windowWidth,
      windowHeight
    } = dimensions;

    const { x, y } = position;

    const viewportBottom = windowScroll + windowHeight;
    const bottomPosition = windowScroll + y + spaceFromMouse;
    const topPosition = windowScroll + y - (spaceFromMouse + height);

    const topPositionWithFallback =
      topPosition > windowScroll ? topPosition : bottomPosition;

    const containerCenter = width / 2;

    const getXPosition = () => {
      if (x - containerCenter < 0) {
        return 0 - ARROW_WIDTH / 2;
      }

      if (x - containerCenter > 0 && x + containerCenter < windowWidth) {
        return x - containerCenter;
      }

      if (x + containerCenter > windowWidth) {
        return windowWidth - width + ARROW_WIDTH / 2;
      }

      return x;
    };

    const getYPosition = () =>
      !preferTop && bottomPosition + height < viewportBottom
        ? bottomPosition
        : topPositionWithFallback;

    this.setArrowPosition(dimensions, x);

    return {
      x: getXPosition(),
      y: getYPosition()
    };
  };

  getTranslateByDirection = direction => {
    switch (direction) {
      case TOP:
        return "translate(0, 10px)";
      case BOTTOM:
        return "translate(0, -10px)";
      default:
        return "translate(0, 10px)";
    }
  };

  setArrowPosition = (dimensions, xPos) => {
    const rightBound = Math.min(
      dimensions.windowWidth,
      dimensions.width + xPos
    );

    const leftBound = 0;
    const rightEdge = xPos + dimensions.width / 2;
    const leftEdge = xPos - dimensions.width / 2;
    const arrowSpace = ARROW_WIDTH / 2;
    const borderRadius = parseInt(
      constants.borderRadius.large.split("px")[0],
      10
    );

    let centerOffset = 0;

    if (leftEdge < leftBound) {
      centerOffset = (leftEdge - leftBound) * 1 + arrowSpace;
    } else if (rightEdge > rightBound) {
      centerOffset = (rightEdge - rightBound) * 1 - (arrowSpace - borderRadius);
    }

    this.setState({
      arrowAdjustment: centerOffset
    });
  };

  /* 
   * Function that forces a re-render of the tooltip
   */

  refresh = () => {
    if (this.props.isVisible) {
      this.tooltipEnter();
      this.tooltipEntering();
    }
  };

  updateSize = () => {
    const { isVisible } = this.props;

    const dimensions = {};

    if (global.window && isVisible) {
      const { innerWidth, innerHeight } = global.window;

      const scrollTop = Math.max(
        global.window.pageYOffset,
        global.document.documentElement.scrollTop,
        global.document.body.scrollTop
      );

      dimensions.windowScroll = scrollTop;
      dimensions.windowWidth = innerWidth;
      dimensions.windowHeight = innerHeight;
    }

    if (this.myRef.current) {
      this.myRef.current.style.top = "0px";
      this.myRef.current.style.left = "0px";

      const { clientWidth, clientHeight } = this.myRef.current;

      dimensions.width = clientWidth;
      dimensions.height = clientHeight;
    }

    if (Object.keys(dimensions).length) {
      this.dimensions = dimensions;
      return true;
    }

    return false;
  };

  tooltipEnter = () => {
    const { isVisible, position, spaceFromMouse } = this.props;

    if (isVisible) {
      this.updateSize();

      this.pos = this.getPositionAndUpdateDirection({
        position,
        dimensions: this.dimensions,
        spaceFromMouse
      });
    }

    this.myRef.current.style.top = `${this.pos.y}px`;
    this.myRef.current.style.left = `${this.pos.x}px`;

    this.myRef.current.style.transition = `opacity 0.3s ${
      constants.easing.easeOutQuad
    }`;

    this.myRef.current.style.transform = this.getTranslateByDirection(
      this.state.actualDirection
    );
  };

  tooltipEntering = () => {
    this.myRef.current.style.transition = `opacity 0.3s ${
      constants.easing.easeOutQuad
    },
      transform 0.3s ${constants.easing.easeOutQuad}`;
    this.myRef.current.style.transform = "translate(0)";
  };

  tooltipExit = () => {
    this.myRef.current.style.transition = `opacity 0.1s ${
      constants.easing.easeInQuad
    }`;
  };

  render() {
    const { children, isVisible, variant, ...rest } = this.props;
    const { arrowAdjustment } = this.state;
    const direction = this.getDirection();

    return (
      <Portal>
        <CSSTransition
          in={isVisible}
          key="tooltip-animation"
          timeout={300}
          classNames="open"
          onEnter={this.tooltipEnter}
          onEntering={this.tooltipEntering}
          onExit={this.tooltipExit}
          appear={isVisible}
          variant={variant}
        >
          <StyledTooltip
            ref={this.myRef}
            isVisible={isVisible}
            {...rest}
            direction={direction}
            arrowAdjustment={`${arrowAdjustment}px`}
          >
            {children}
          </StyledTooltip>
        </CSSTransition>
      </Portal>
    );
  }
}

SeatMapTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  variant: PropTypes.oneOf(VARIANTS),
  spaceFromMouse: PropTypes.number,
  preferTop: PropTypes.bool,
  directionChanged: PropTypes.func
};

SeatMapTooltip.defaultProps = {
  isVisible: false,
  variant: LIGHT,
  position: {
    x: 0,
    y: 0
  },
  spaceFromMouse: SPACE_FROM_MOUSE,
  preferTop: true,
  directionChanged: null
};

SeatMapTooltip.displayName = "SeatMapTooltip";

export default SeatMapTooltip;
