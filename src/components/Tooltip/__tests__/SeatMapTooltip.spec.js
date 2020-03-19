import React from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import "jest-styled-components";

import SeatMapTooltip from "../SeatMapTooltip";

Enzyme.configure({ adapter: new Adapter() });

jest.mock("../../PopOver/PopOverPortal", () => ({ children }) => children);

jest.mock("react-transition-group", () => ({
  CSSTransition: ({ children }) => children
}));

let wrapper;
let styles;
let props;

const tooltipRef = React.createRef();

const bigContent = `Ut lectus arcu bibendum at varius vel. Vitae nunc sed velit dignissim sodales ut eu sem. 
  Velit sed ullamcorper morbi tincidunt ornare massa. Praesent elementum facilisis leo vel 
  fringilla est ullamcorper eget.`;

const div = global.document.createElement("div");

const styleProps = {
  width: "100px",
  height: "50px",
  display: "block"
};

const children = <div>{bigContent}</div>;

const renderComponent = () =>
  mount(
    <SeatMapTooltip {...props} style={styleProps}>
      {children}
    </SeatMapTooltip>,
    { attachTo: div }
  );

global.document.body.appendChild(div);

describe("SeatMapTooltip", () => {
  afterEach(() => {
    wrapper.detach();
  });

  describe("Rendering Default", () => {
    const position = {
      x: 500,
      y: 250
    };

    beforeEach(() => {
      props = {
        ref: tooltipRef,
        position,
        isVisible: true
      };

      wrapper = renderComponent(props, children);
      wrapper.instance().getTooltipPosition = jest
        .fn()
        .mockReturnValue(position);
      styles = wrapper.getDOMNode().style;
    });

    afterEach(() => {
      wrapper.detach();
    });

    it("renders default SeatMapTooltip", () => {
      expect(styles.width).toEqual(styleProps.width);
      expect(styles.height).toEqual(styleProps.height);
      expect(wrapper.prop("isVisible")).toEqual(true);
      expect(wrapper.state("actualDirection")).toEqual("top");
    });

    it("positions the tooltip above position.y", () => {
      const top = parseInt(styles.top.split("px")[0], 10);
      expect(top < position.y).toBe(true);
    });

    it("calls getTooltipPosition", () => {
      wrapper.instance().refresh();
      expect(wrapper.instance().getTooltipPosition).toHaveBeenCalled();
    });
  });

  describe("Rendering Position Bottom", () => {
    const position = {
      x: 500,
      y: 250
    };

    beforeEach(() => {
      props = {
        ref: tooltipRef,
        position,
        isVisible: true,
        preferTop: false
      };

      wrapper = renderComponent(props, children);
      styles = wrapper.getDOMNode().style;
    });

    it("renders default SeatMapTooltip below position.y", () => {
      const top = parseInt(styles.top.split("px")[0], 10);

      expect(wrapper.state("actualDirection")).toEqual("bottom");
      expect(top > position.y).toBe(true);
    });
  });

  describe("Rendering Left Top", () => {
    const position = {
      x: 0,
      y: 20
    };

    beforeEach(() => {
      props = {
        ref: tooltipRef,
        position,
        isVisible: true
      };

      wrapper = renderComponent(props, children);
      styles = wrapper.getDOMNode().style;
    });

    it("renders SeatMapTooltip below position.y", () => {
      const top = parseInt(styles.top.split("px")[0], 10);
      const left = parseInt(styles.left.split("px")[0], 10);

      expect(wrapper.state("actualDirection")).toEqual("bottom");
      expect(top > position.y).toBe(true);
      expect(left).toBe(position.x);
    });
  });

  describe("Rendering Right Bottom", () => {
    const position = {
      x: global.window.innerWidth,
      y: global.window.innerHeight - 10
    };

    beforeEach(() => {
      props = {
        ref: tooltipRef,
        position,
        isVisible: true
      };

      wrapper = renderComponent(props, children);
      styles = wrapper.getDOMNode().style;
    });

    it("renders SeatMapTooltip below position.y", () => {
      const top = parseInt(styles.top.split("px")[0], 10);
      const left = parseInt(styles.left.split("px")[0], 10);

      expect(wrapper.state("actualDirection")).toEqual("top");
      expect(top < position.y).toBe(true);
      expect(left).toBe(position.x);
    });
  });

  describe("tooltip refresh", () => {
    let element;

    beforeEach(() => {
      const tooltip = mount(<SeatMapTooltip isVisible>test</SeatMapTooltip>);

      element = {
        style: {}
      };

      tooltip.instance().myRef.current = element;

      tooltip.instance().refresh();
    });

    it("should force a update the position", () => {
      expect(element.style.top).toBeTruthy();
      expect(element.style.left).toBeTruthy();
    });
  });

  describe("tooltip directionChanged callback", () => {
    const callback = jest.fn();
    let tree;

    const position = {
      x: 500,
      y: 250
    };

    beforeEach(() => {
      tree = mount(
        <SeatMapTooltip
          directionChanged={callback}
          position={position}
          isVisible
        />
      ).instance();
      tree.setState({
        actualDirection: "top"
      });
    });

    afterEach(() => {
      callback.mockRestore();
    });

    it("does not call callback when direction remains the same", () => {
      expect(callback).not.toHaveBeenCalled();
      expect(tree.state).toEqual({
        actualDirection: "top",
        arrowAdjustment: 0
      });
    });

    it("does not call callback when direction remains the same", () => {
      tree.getPositionAndUpdateDirection({
        position: {
          x: 500,
          y: 10
        },
        dimensions: {
          windowScroll: 100
        }
      });

      expect(callback).toHaveBeenCalledWith("bottom");
      expect(tree.state).toEqual({
        actualDirection: "bottom",
        arrowAdjustment: 0
      });
    });
  });
});
