import React from 'react';
import Twitter from './Twitter/Twitter';
import Facebook from './Faceboook/Facebook';
import './SocialMedia.css';

class SocialMedia extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 0,
    };
  }

  switchSocialMedia = () => {
    this.setState((prevState) => ({
      show: prevState.show < 1 ? (prevState.show + 1) : 0,
    }));
  };

  render() {
    const socialMedia = [
      <Twitter key="twitter" searchKey={this.props.searchKey} />,
      <Facebook key="facebook" searchKey={this.props.searchKey} />,
    ];
    return (
      <section className="card__social-media">
        {socialMedia[this.state.show]}
        <div className="center next-container">
          <button className="next__text" onClick={this.switchSocialMedia}>
            NEXT
          </button>
        </div>
      </section>
    );
  }
}

export default SocialMedia;
