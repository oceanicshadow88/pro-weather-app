import React from 'react';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome/index.es';
import Loading from '../../Loading/Loading';
import { getTwitter } from '../../../api/twitterapi';

class Twitter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      data: [],
      error: false,
      show: 0,
    };
  }

  async componentDidMount() {
    const result = await getTwitter(this.props.searchKey);
    this.setState({ data: result.data, isLoaded: true, error: false });
  }

  render() {
    return (
      <section>
        <div className="card__social-media-header flex align--bottom flex-warp">
          <FontAwesomeIcon icon={faTwitter} className="color--twitter-blue" />
          <h2 className="card__social-media-header">Twitter Feed</h2>
          <a href="http://www.kitmanyiu.com" className="color--blue social-media-link">
            #{this.props.searchKey.replace(/ /g, '')}weather
          </a>
        </div>
        <div className="card__post-container">
          {!this.state.isLoaded ? (
            <Loading />
          ) : (
            this.state.data.statuses.slice(0, 10).map((status, id) => (
              <div className="card__social-media-post" key={id}>
                <div className="flex align--left align--center flex-warp">
                  <img
                    src={status.user.profile_image_url_https}
                    alt="Avatar"
                    className="social-media-profile__img"
                  />
                  <p className="card__social-media-comment">{status.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }
}

export default Twitter;
