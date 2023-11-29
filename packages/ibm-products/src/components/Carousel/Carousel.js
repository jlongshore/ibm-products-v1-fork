/**
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import PropTypes from 'prop-types';
import { CarouselItem } from './CarouselItem';
import cx from 'classnames';
import { getDevtoolsProps } from '../../global/js/utils/devtools';
import { pkg } from '../../settings';

// The block part of our conventional BEM class names (blockClass__E--M).
const blockClass = `${pkg.prefix}--carousel`;
const componentName = 'Carousel';

// Default values for props
const defaults = {
  disableArrowScroll: false,
  onScroll: () => {},
  onChangeIsScrollable: () => {},
};

/**
 * The Carousel acts as a scaffold for other Novice to Pro content.
 *
 * This component is not intended for general use.
 *
 * Expected scrolling behavior.
 * 1. Scroll the maximum number of visible items at a time.
 * 2. The left-most item should always be left-aligned in the viewport.
 *
 * Exception.
 * 1. After scrolling to the last (right-most) item,
 *      if some of its content remains hidden,
 *      then nudge it to the right until it is right-aligned.
 * 2. From the right-aligned position, when scrolling left,
 *      the left-most item should again be left-aligned.
 */
export let Carousel = React.forwardRef(
  (
    {
      children,
      className,
      disableArrowScroll = defaults.disableArrowScroll,
      fadedEdgeColor,
      onChangeIsScrollable = defaults.onChangeIsScrollable,
      onScroll = defaults.onScroll,
      ...rest
    },
    ref
  ) => {
    const carouselRef = useRef();
    const scrollRef = useRef();

    const childElementsRef = useRef(
      Array(React.Children.count(children)).fill(useRef(null))
    );

    const leftFadedEdgeColor = fadedEdgeColor?.left || fadedEdgeColor;
    const rightFadedEdgeColor = fadedEdgeColor?.right || fadedEdgeColor;

    // Return the current state of the carousel.
    const getWidths = useCallback(() => {
      const alltemWidths = childElementsRef.current.reduce((acc, curVal) => {
        const curValRect = curVal.getBoundingClientRect();
        return acc + curValRect.width;
      }, 0);

      // viewport's width
      const clientWidth = scrollRef.current.clientWidth;
      // scroll position
      const scrollLeft = parseInt(scrollRef.current.scrollLeft, 10);
      // scrollable width
      const scrollWidth = scrollRef.current.scrollWidth;

      return {
        clientWidth,
        itemWidths: alltemWidths,
        scrollLeft,
        scrollWidth,
      };
    }, []);

    // Trigger callbacks to report state of the carousel
    const handleScroll = useCallback(() => {
      const { clientWidth, scrollLeft, scrollWidth } = getWidths();
      // The maximum scrollLeft achievable is the scrollable width - the viewport width.
      const scrollLeftMax = scrollWidth - clientWidth;
      // if isNaN(scrollLeft / scrollLeftMax), then set to zero
      const scrollPercent =
        parseFloat((scrollLeft / scrollLeftMax).toFixed(2)) || 0;

      if (!scrollRef.current) {
        return;
      }

      // Callback 1: Does the carousel have enough content to enable scrolling?
      onChangeIsScrollable(scrollWidth > clientWidth);

      // Callback 2: Return the percentage of current scroll, between 0 and 1.
      onScroll(scrollPercent);
    }, [getWidths, onChangeIsScrollable, onScroll]);

    const getElementInView = useCallback((containerRect, elementRect) => {
      const leftIsRightOfContainerLeft = elementRect.left >= containerRect.left;
      const rightIsLeftOfContainerRight =
        elementRect.right <= containerRect.right;
      return leftIsRightOfContainerLeft && rightIsLeftOfContainerRight;
    }, []);

    const getElementsInView = useCallback(() => {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const inViewElements = childElementsRef.current.filter((el) =>
        getElementInView(containerRect, el.getBoundingClientRect())
      );
      return inViewElements;
    }, [getElementInView]);

    const handleNext = useCallback(() => {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const elRectsInView = getElementsInView().map((el) =>
        el.getBoundingClientRect()
      );
      const visibleWidth = elRectsInView.reduce(
        (acc, curVal) => acc + curVal.width,
        0
      );

      const scrollValue = visibleWidth > 0 ? visibleWidth : containerRect.width;
      scrollRef.current.scrollLeft += scrollValue;
    }, [getElementsInView]);

    const handlePrev = useCallback(() => {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const elRectsInView = getElementsInView().map((el) =>
        el.getBoundingClientRect()
      );
      const visibleWidth = elRectsInView.reduce(
        (acc, curVal) => acc + curVal.width,
        0
      );

      const scrollValue =
        visibleWidth > 0
          ? visibleWidth - elRectsInView[0].left
          : containerRect.width + containerRect.left;
      scrollRef.current.scrollLeft -= scrollValue;
    }, [getElementsInView]);

    const handleReset = useCallback(() => {
      scrollRef.current.scrollLeft = 0;
    }, []);

    // Trigger a callback after first render (and applied CSS).
    useEffect(() => {
      // Normally, we can trigger a callback "immediately after first
      // render", because we will be doing more "logical" work (update
      // a state, show / hide a feature, etc.), and the final, applied
      // CSS,can "catch up" asynchronously without breaking anything.
      setTimeout(() => {
        // Because we are making calculations based on the final,
        // applied CSS, we must wait for one more "tick".
        handleScroll();
      }, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On window.resize, reset carousel to zero.
    useEffect(() => {
      const handleWindowResize = () => {
        scrollRef.current.scrollLeft = 0;
        handleScroll();
      };

      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
    }, [handleScroll]);

    // On scrollRef.scrollend, trigger a callback.
    useEffect(() => {
      const handleScrollend = () => {
        handleScroll();
      };

      const scrollDiv = scrollRef.current;
      scrollDiv.addEventListener('scrollend', handleScrollend);
      return () => scrollDiv.removeEventListener('scrollend', handleScrollend);
    }, [handleScroll]);

    // Disable wheel scrolling
    useEffect(() => {
      function handleWheel(event) {
        // update the scroll position
        event.stopPropagation();
        event.preventDefault();
        event.cancelBubble = false;
      }
      const scrollDiv = scrollRef.current;
      if (scrollDiv) {
        scrollDiv.addEventListener('wheel', handleWheel, {
          passive: false,
        });
        return () => {
          scrollDiv.removeEventListener('wheel', handleWheel, {
            passive: false,
          });
        };
      }
    }, []);

    // Enable arrow scrolling from within the carousel
    useEffect(() => {
      function handleKeydown(event) {
        const { key } = event;

        if (
          (key === 'ArrowLeft' || key === 'ArrowRight') &&
          disableArrowScroll
        ) {
          event.stopPropagation();
          event.preventDefault();
          event.cancelBubble = false;
        }
      }

      const carouselDiv = carouselRef.current;
      if (carouselDiv) {
        carouselDiv.addEventListener('keydown', handleKeydown);
        return () => carouselDiv.removeEventListener('keydown', handleKeydown);
      }
    }, [disableArrowScroll]);

    // Enable external function calls
    useImperativeHandle(
      ref,
      () => ({
        scrollNext() {
          handleNext();
        },
        scrollPrev() {
          handlePrev();
        },
        scrollReset() {
          handleReset();
        },
      }),
      [handleNext, handlePrev, handleReset]
    );

    return (
      <div
        {...rest}
        tabIndex={-1}
        className={cx(blockClass, className)}
        ref={carouselRef}
        role="main"
        {...getDevtoolsProps(componentName)}
      >
        <div className={cx(`${blockClass}__elements-container`)}>
          <div className={`${blockClass}__elements`} ref={scrollRef}>
            {React.Children.map(children, (child, idx) => {
              return (
                <CarouselItem
                  key={idx}
                  ref={(ci) => (childElementsRef.current[idx] = ci)}
                >
                  {child}
                </CarouselItem>
              );
            })}
          </div>

          {leftFadedEdgeColor && (
            <div
              className={`${blockClass}__elements-container--scrolled`}
              style={{
                background: `linear-gradient(90deg, ${leftFadedEdgeColor}, transparent)`,
              }}
            ></div>
          )}

          {rightFadedEdgeColor && (
            <div
              className={`${blockClass}__elements-container--scroll-max`}
              style={{
                background: `linear-gradient(270deg, ${rightFadedEdgeColor}, transparent)`,
              }}
            ></div>
          )}
        </div>
      </div>
    );
  }
);

Carousel.displayName = componentName;

// The types and DocGen commentary for the component props,
// in alphabetical order (for consistency).
// See https://www.npmjs.com/package/prop-types#usage.
Carousel.propTypes = {
  /**
   * Provide the contents of the Carousel.
   */
  children: PropTypes.node.isRequired,
  /**
   * Provide an optional class to be applied to the containing node.
   */
  className: PropTypes.string,
  /**
   * Disables the ability of the Carousel to scroll
   * use a keyboard's left and right arrow keys.
   */
  disableArrowScroll: PropTypes.bool,
  /**
   * Enables the edges of the component to have faded styling.
   *
   * Pass a single string (`$color`) to specify the same color for left and right.
   *
   * Or pass an object (`{ left: $color1, right: $color2 }`) to specify different colors.
   */
  fadedEdgeColor: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ left: PropTypes.string, right: PropTypes.string }),
  ]),
  /**
   * An optional callback function that returns `true`
   * when the carousel has enough content to be scrollable,
   * and `false` when there is not enough content.
   */
  onChangeIsScrollable: PropTypes.func,
  /**
   * An optional callback function that returns the scroll position as
   * a value between 0 and 1.
   */
  onScroll: PropTypes.func,
};
