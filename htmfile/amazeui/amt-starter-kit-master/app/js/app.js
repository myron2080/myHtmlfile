import React from 'react';
import {
  render,
} from 'react-dom';
import {
  Router,
  Route,
  Link,
  IndexRoute,
} from 'react-router';
import {
  Container,
  TabBar,
} from 'amazeui-touch';

const App = React.createClass({
  render() {
    const {
      location,
      params,
      children,
      ...props,
      } = this.props;
    const transition = children.props.transition || 'sfr';

    return (
      <Container direction="column" id="sk-container">
        <Container
          transition={transition}
        >
          {React.cloneElement(children, {key: location.key})}
        </Container>

        <TabBar
          amStyle="primary"
        >
          <TabBar.Item
            component={Link}
            icon="list"
            title="组件"
            selected={!params.page}
            to="/"
          />
          <TabBar.Item
            component={Link}
            icon="info"
            title="关于"
            badge="404"
            selected={params.page === 'about'}
            to="/about"
          />
        </TabBar>
      </Container>
    );
  },
});

// Pages
import Index from './pages/Index';
import Page from './pages/Page';

const routes = (
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Index} />
      <Route path=":page" component={Page} />
    </Route>
  </Router>
);

document.addEventListener('DOMContentLoaded', () => {
  render(routes, document.getElementById('root'));
});
