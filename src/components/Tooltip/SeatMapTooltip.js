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

    const adjustment = this.adjustArrow({
      coords: { x: result.x, width: dimensions.width },
      position
    });

    let direction = null;

    if (result.y < position.y + dimensions.windowScroll) {
      direction = TOP;
    } else if (result.y > position.y + dimensions.windowScroll) {
      direction = BOTTOM;
    }

    this.setState((prevState, props) => {
      const { directionChanged } = props;
      const { actualDirection } = prevState;

      if (
        actualDirection !== direction ||
        prevState.arrowAdjustment !== adjustment
      ) {
        if (direction && directionChanged) {
          directionChanged(direction);
        }

        return {
          actualDirection: direction || actualDirection,
          arrowAdjustment: adjustment
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

      if (x + containerCenter > windowWidth - containerCenter) {
        const overflow = x + containerCenter - windowWidth;
        return x - overflow + ARROW_WIDTH / 2;
      }

      return x;
    };

    const getYPosition = () =>
      !preferTop && bottomPosition + height < viewportBottom
        ? bottomPosition
        : topPositionWithFallback;

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

  /* 
   * Function that forces a re-render of the tooltip
   */

  refresh = () => {
    if (this.props.isVisible) {
      this.tooltipEnter();
      this.tooltipEntering();
    }
  };

  adjustArrow = ({ coords, position }) => {
    const reqCenter = position.x;
    const currentCenter = coords.x + coords.width / 2;

    return reqCenter - currentCenter;
  };

  updateSize = () => {
    const { isVisible } = this.props;

    const {
      windowScroll,
      windowWidth,
      windowHeight,
      width,
      height
    } = this.dimensions;

    const dimensions = {};

    if (global.window && isVisible) {
      const {
        clientWidth,
        clientHeight
      } = global.window.document.documentElement;

      const scrollTop = Math.max(
        global.window.pageYOffset,
        global.document.documentElement.scrollTop,
        global.document.body.scrollTop
      );

      if (scrollTop !== windowScroll) {
        dimensions.windowScroll = scrollTop;
      }

      if (clientWidth !== windowWidth) {
        dimensions.windowWidth = clientWidth;
      }

      if (clientHeight !== windowHeight) {
        dimensions.windowHeight = clientHeight;
      }
    }

    if (this.myRef.current) {
      const { clientWidth, clientHeight } = this.myRef.current;

      if (width !== clientWidth && clientWidth) {
        dimensions.width = clientWidth;
      }

      if (height !== clientHeight && clientHeight) {
        dimensions.height = clientHeight;
      }
    }

    if (Object.keys(dimensions).length) {
      this.dimensions = {
        ...this.dimensions,
        ...dimensions
      };
      return true;
    }

    return false;
  };

  tooltipEnter = () => {
    const {
      isVisible,
      position,
      spaceFromMouse,
      reduceTop,
      reduceBottom
    } = this.props;

    if (isVisible) {
      const reduce = { top: reduceTop, bottom: reduceBottom };

      this.updateSize();

      this.pos = this.getPositionAndUpdateDirection({
        position,
        dimensions: this.dimensions,
        spaceFromMouse,
        reduce
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

    console.log("SeatMapTooltip");

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
