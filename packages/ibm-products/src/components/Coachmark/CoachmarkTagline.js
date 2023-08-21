/**
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Import portions of React that are needed.
import React from 'react';

// Other standard imports.
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Close16, Idea16 } from '@carbon/icons-react';
import { Button } from 'carbon-components-react';
import { useCoachmark } from './utils/context';
import { getDevtoolsProps } from '../../global/js/utils/devtools';
import { pkg /*, carbon */ } from '../../settings';

// The block part of our conventional BEM class names (blockClass__E--M).
const blockClass = `${pkg.prefix}--coachmark-tagline`;
const componentName = 'CoachmarkTagline';

const defaults = {
  closeIconDescription: 'Close',
  onClose: () => {},
  theme: 'light',
};

/**
 * DO NOT USE. This component is for the exclusive use
 * of other Novice to Pro components.
 */
export let CoachmarkTagline = React.forwardRef(
  (
    {
      closeIconDescription = defaults.closeIconDescription,
      onClose = defaults.onClose,
      theme = defaults.theme,
      title,
      ...rest
    },
    ref
  ) => {
    const coachmark = useCoachmark();

    return (
      <div
        {
          // Pass through any other property values as HTML attributes.
          ...rest
        }
        className={cx(
          blockClass,
          `${blockClass}__${theme}`,
          coachmark.isOpen && `${blockClass}--is-open`
        )}
        ref={ref}
        {...getDevtoolsProps(componentName)}
      >
        <button
          // {...rest}
          className={`${blockClass}__cta`}
          type="button"
          {...coachmark.buttonProps}
        >
          <div className={`${blockClass}__idea`}>
            <Idea16 />
          </div>
          <div>{title}</div>
        </button>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Close16}
          iconDescription={closeIconDescription}
          hasIconOnly
          className={`${blockClass}--close-btn`}
          onClick={onClose}
        />
      </div>
    );
  }
);

// Return a placeholder if not released and not enabled by feature flag
CoachmarkTagline = pkg.checkComponentEnabled(CoachmarkTagline, componentName);

// The display name of the component, used by React. Note that displayName
// is used in preference to relying on function.name.
CoachmarkTagline.displayName = componentName;

// The types and DocGen commentary for the component props,
// in alphabetical order (for consistency).
// See https://www.npmjs.com/package/prop-types#usage.
CoachmarkTagline.propTypes = {
  /**
   * Tooltip text and aria label for the Close button icon.
   */
  closeIconDescription: PropTypes.string,
  /**
   * Function to call when the close button is clicked.
   */
  onClose: PropTypes.func,
  /**
   * Determines the theme of the component.
   */
  theme: PropTypes.oneOf(['light', 'dark']),
  /**
   * The title of the tagline.
   */
  title: PropTypes.string.isRequired,
};
