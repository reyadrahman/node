/* @flow */

import Component from '../../../front-end-framework/component.js';
import type { LandingPageAppContext, LandingPageAppSubPageProps } from '../types.js';

export default class FrontPage extends Component<LandingPageAppContext, LandingPageAppSubPageProps> {
    render() {
        const { className } = this.props;
        // const state = this.props.stateCursor.get();

        return `
            <div id="privacy-page" class="${className} page-wrapper">
                <section class="bg-faded text-xs-center privacy-section">
                  <div class="container">
                    <h3>Privacy</h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque pulvinar eu lectus eu maximus. Fusce et consectetur nibh. In suscipit justo mi, ac gravida erat tristique vel. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec a nulla in enim iaculis laoreet. Proin augue quam, pretium at aliquam vitae, semper non ante. Donec vitae massa pellentesque, maximus mauris ut, euismod arcu. Nulla facilisi. Vivamus ac orci rutrum, posuere orci vitae, sagittis leo.
                        sed nec cursus velit. vivamus ultricies non velit ut mattis. donec condimentum enim quis efficitur eleifend. pellentesque eget nisl ac arcu lacinia facilisis. praesent vitae dictum purus. nulla sollicitudin dolor id dui sollicitudin tristique. cras commodo tincidunt tortor, non fringilla dolor tristique in. ut leo ante, bibendum sit amet justo a, pretium lobortis odio. morbi ac lacus id quam aliquet dignissim ut eu nisi. proin non ligula metus. ut rhoncus odio nec imperdiet maximus. nullam hendrerit a mi sit amet vestibulum. pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                        fusce nec nulla tortor. sed quis magna commodo, lobortis ex vel, vehicula mi. nulla facilisi. nullam sit amet diam varius, pellentesque nisi non, volutpat neque. aliquam sapien eros, dictum et est vel, laoreet sodales elit. proin sit amet arcu molestie ipsum rhoncus porttitor ac maximus odio. donec eu velit libero.
                        etiam consectetur consequat sapien, at sagittis lorem pretium ut. etiam porttitor pellentesque eros vitae convallis. nulla pharetra lectus eu justo pellentesque, sit amet vestibulum libero porta. nam et tortor eget nibh malesuada fringilla eu vel lacus. aliquam a auctor ipsum. interdum et malesuada fames ac ante ipsum primis in faucibus. donec dolor arcu, iaculis ut porttitor eget, feugiat vitae lorem. donec neque dolor, auctor dignissim gravida ac, interdum ut risus. vivamus laoreet viverra felis. mauris lacus dui, condimentum ut quam a, tincidunt rhoncus odio. vestibulum id condimentum arcu, sed interdum ipsum. in laoreet est dolor, vel faucibus erat laoreet vel. morbi porttitor risus at sodales fermentum. sed nibh odio, volutpat sit amet vulputate et, malesuada at metus.
                        mauris dapibus, nisl vel varius euismod, diam lorem porta libero, id porttitor metus tortor facilisis velit. curabitur tempus, erat et imperdiet tempor, nunc metus vehicula elit, dignissim tincidunt dolor quam et quam. nulla facilisi. fusce dictum lectus ut imperdiet dignissim. phasellus iaculis sed lectus id ornare. nam non mollis diam, a ultrices dolor. duis convallis molestie turpis eu semper. vivamus imperdiet auctor imperdiet.
                    </p>
                  </div>
                </section>
            </div>
        `;
    }
}
