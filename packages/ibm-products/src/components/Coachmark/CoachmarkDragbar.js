/**
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Import portions of React that are needed.
import React, { useEffect, useState } from 'react';

// Other standard imports.
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Close16, Draggable16 } from '@carbon/icons-react';
import { Button } from 'carbon-components-react';
import { getDevtoolsProps } from '../../global/js/utils/devtools';
import { pkg /*, carbon */ } from '../../settings';

// Carbon and package components we use.
/* TODO: @import(s) of carbon components and other package components. */

// The block part of our conventional BEM class names (blockClass__E--M).
const blockClass = `${pkg.prefix}--coachmark-dragbar`;
const componentName = 'CoachmarkDragbar';

const defaults = {
  closeIconDescription: 'Close',
  onDrag: () => {},
  onClose: () => {},
  showCloseButton: true,
  theme: 'light',
};

/**
 * DO NOT USE. This component is for the exclusive use
 * of other Novice to Pro components.
 */
export let CoachmarkDragbar = React.forwardRef(
  (
    {
      closeIconDescription = defaults.closeIconDescription,
      onClose = defaults.onClose,
      onDrag = defaults.onDrag,
      showCloseButton = defaults.showCloseButton,
      theme = defaults.theme,
      ...rest
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    useEffect(() => {
      const handleDragStop = () => setIsDragging(false);
      window.addEventListener('mouseup', handleDragStop);
      return () => {
        window.removeEventListener('mouseup', handleDragStop);
      };
    }, []);

    useEffect(() => {
      const handleDrag = (event) => {
        onDrag(event.movementX, event.movementY);
      };
      if (isDragging) {
        window.addEventListener('mousemove', handleDrag);
      }
      return () => {
        window.removeEventListener('mousemove', handleDrag);
      };
    }, [isDragging, onDrag]);

    const handleDragStart = () => setIsDragging(true);

    return (
      <header
        {
          // Pass through any other property values as HTML attributes.
          ...rest
        }
        className={cx(
          blockClass, // Apply the block class to the main HTML element
          `${blockClass}__${theme}`,
          // example: `${blockClass}__template-string-class-${kind}-n-${size}`,
          {
            // switched classes dependant on props or state
            // example: [`${blockClass}__here-if-small`]: size === 'sm',
          }
        )}
        ref={ref}
        role="main"
        {...getDevtoolsProps(componentName)}
      >
        <button
          type="button"
          className={`${blockClass}__handle`}
          onMouseDown={handleDragStart}
        >
          <Draggable16 />
        </button>

        {showCloseButton && (
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close16}
            iconDescription={closeIconDescription}
            hasIconOnly
            className={`${blockClass}--close-btn`}
            onClick={onClose}
          />
        )}
      </header>
    );
  }
);

// Return a placeholder if not released and not enabled by feature flag
CoachmarkDragbar = pkg.checkComponentEnabled(CoachmarkDragbar, componentName);

// The display name of the component, used by React. Note that displayName
// is used in preference to relying on function.name.
CoachmarkDragbar.displayName = componentName;

// The types and DocGen commentary for the component props,
// in alphabetical order (for consistency).
// See https://www.npmjs.com/package/prop-types#usage.
CoachmarkDragbar.propTypes = {
  /**
   * Tooltip text and aria label for the Close button icon.
   */
  closeIconDescription: PropTypes.string,
  /**
   * Function to call when the close button is clicked.
   */
  onClose: PropTypes.func,
  /**
   * Function to call when the user clicks and drags the Coachmark.
   * For internal use only by the parent CoachmarkOverlay.
   */
  onDrag: PropTypes.func,
  /**
   * Show/hide the "X" close button.
   */
  showCloseButton: PropTypes.bool,
  /**
   * Determines the theme of the component.
   */
  theme: PropTypes.oneOf(['light', 'dark']),
};