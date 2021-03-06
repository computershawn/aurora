import React, { Component } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import classnames from "classnames";

import spacing from "../../theme/spacing";
import colorThemes from "../../theme/colorThemes";

import { Row } from "../Grid";
import OverflowIcon from "../Icons/Overflow";
import { mediumAndUp } from "../../theme/mediaQueries";

import RowToggler, { IconButton } from "./RowToggler";
import constants from "../../theme/constants";
import { OverflowDesktopContainer } from "./RowContent";

const RowWrapper = styled.div`
  background-color: ${colorThemes.global.white.base};
  border-bottom: 1px solid ${colorThemes.global.gray04};
  border-top: 1px solid ${colorThemes.global.gray04};
  border-right: 1px solid ${colorThemes.global.white.base};
  border-left: 1px solid ${colorThemes.global.white.base};
  margin-bottom: -1px;
  padding: 0 ${spacing.cozy};
  &:first-child {
    border-top: 0px;
  }

  ${mediumAndUp`
    padding: 0 ${spacing.normal};
    &.row__wrapper--expanded {
      transition: box-shadow 0.3s ${
        constants.easing.easeInOutQuad
      }, margin-bottom 0.3s ${constants.easing.easeInOutQuad};
      margin-bottom: 3px;
      margin-top: 3px;
      border-radius: 4px;
      box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.12);
      border: 1px solid ${colorThemes.global.gray04};
      overflow: hidden;
    }
    
    &.row__wrapper--collapsed {
      transition: box-shadow 0.3s ${
        constants.easing.easeInQuad
      }, margin-bottom 0.3s ${constants.easing.easeInQuad};
      box-shadow: 0;
      margin-bottom: -1px;
    }
  `};

  .button--expand-or-collapse {
    position: absolute;
    right: ${props => (props.rowTriggerPosition === "right" ? "0" : "auto")};
    left: ${props => (props.rowTriggerPosition === "left" ? "0" : "auto")};
    z-index: 10;
    margin: 0;
    padding: 0;
    /* spacing.spacious is spacing.normal * 2 - paddings for ListContainer */
    height: calc(100% - ${spacing.spacious});
  }
`;

const ListContainer = styled.div`
  background-color: ${colorThemes.global.white.base};
  align-items: stretch;
  display: flex;
  padding-top: ${spacing.normal};
  padding-bottom: ${spacing.normal};
  position: relative;
`;

const PureOverflowDesktopContainer = styled(OverflowDesktopContainer)`
  padding: 0;

  ${mediumAndUp`
    padding: 0;
  `};
`;

const MobileContainer = styled.div`
  display: flex;
  align-items: stretch;
  ${mediumAndUp`
    display: none;
  `};
`;

const ContentRow = styled(Row)`
  width: 100%;
  position: relative;
  margin-left: 0;
  margin-right: 0;
  ${mediumAndUp`
    margin-left: 0;
    margin-right: 0;
  `};
`;

class PureListRowContent extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.isOpen && this.props.index !== prevProps.index) {
      this.props.resetOpenIndex();
    }
  }

  componentWillUnmount() {
    if (this.props.isOpen) {
      this.props.resetOpenIndex();
    }
  }

  render() {
    const {
      isOpen,
      index,
      onOverflowClick,
      children,
      onExpandItem,
      onCollapseItem,
      rowTriggerPosition,
      header,
      ...rest
    } = this.props;

    return (
      <RowWrapper
        className={classnames({
          row__wrapper: true,
          "row__wrapper--expanded": isOpen,
          "row__wrapper--collapsed": !isOpen
        })}
        rowTriggerPosition={rowTriggerPosition}
        {...rest}
      >
        {/* this class name is for automation purposes please do not remove or modify the name */}
        <ListContainer className="list__container">
          {rowTriggerPosition === "left" && (
            <RowToggler
              isOpen={isOpen}
              index={index}
              onExpandItem={onExpandItem}
              onCollapseItem={onCollapseItem}
              className="row__toggler"
            />
          )}

          <ContentRow
            rowTriggerPosition={rowTriggerPosition}
            className="row__content"
          >
            {header}
          </ContentRow>

          <MobileContainer>
            <IconButton
              className="button--more-info icon-button--last"
              data-index={index}
              aria-label="More Info"
              onClick={onOverflowClick}
            >
              <OverflowIcon size={22} color={colorThemes.global.onyx.light} />
            </IconButton>
          </MobileContainer>

          {rowTriggerPosition === "right" && (
            <RowToggler
              isOpen={isOpen}
              index={index}
              onExpandItem={onExpandItem}
              onCollapseItem={onCollapseItem}
              className="row__toggler"
            />
          )}
        </ListContainer>

        <PureOverflowDesktopContainer
          className={classnames({
            container__overflow: true,
            "container__overflow--expanded": isOpen,
            "container__overflow--collapsed": !isOpen
          })}
        >
          {children}
        </PureOverflowDesktopContainer>
      </RowWrapper>
    );
  }
}

PureListRowContent.defaultProps = {
  isOpen: false,
  children: null,
  rowTriggerPosition: "right",
  onExpandItem: RowToggler.defaultProps.onExpandItem,
  onCollapseItem: RowToggler.defaultProps.onCollapseItem
};

PureListRowContent.propTypes = {
  isOpen: PropTypes.bool,
  index: PropTypes.number.isRequired,
  onOverflowClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  onExpandItem: RowToggler.propTypes.onExpandItem,
  onCollapseItem: RowToggler.propTypes.onCollapseItem,
  resetOpenIndex: PropTypes.func.isRequired,
  rowTriggerPosition: PropTypes.oneOf(["right", "left"])
};

export default PureListRowContent;
