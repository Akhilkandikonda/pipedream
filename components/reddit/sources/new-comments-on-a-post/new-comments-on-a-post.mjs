import common from "../common.mjs";
import get from "lodash/get.js";
const { reddit } = common.props;

export default {
  ...common,
  type: "source",
  key: "reddit-new-comments-on-a-post",
  name: "New comments on a post",
  description:
    "Emit new event each time a new comment is added to a subreddit.",
  version: "0.0.4",
  dedupe: "unique",
  props: {
    ...common.props,
    subreddit: {
      propDefinition: [
        reddit,
        "subreddit",
      ],
    },
    subredditPost: {
      type: "string",
      label: "Post",
      description:
        "Pipedream will emit a new event when a comment is made on the selected post.",
      optional: false,
      async options() {
        const options = [];
        const results = await this.getAllSubredditPosts();
        for (const subreddit of results) {
          options.push({
            label: subreddit.title,
            value: subreddit.id,
          });
        }
        return options;
      },
    },
    numberOfParents: {
      type: "integer",
      label: "numberOfParents",
      description:
        "When set to 0, the emitted events will only contain the new comment. Otherwise, the events will also contain the parents of the new comment up to the number indicated in this property.",
      optional: true,
      min: 0,
      max: 8,
      default: 0,
    },
    depth: {
      propDefinition: [
        reddit,
        "depth",
      ],
      default: 1,
    },
    includeSubredditDetails: {
      propDefinition: [
        reddit,
        "includeSubredditDetails",
      ],
    },
  },
  hooks: {
    async deploy() {
      // Emits sample events on the first run during deploy.
      var redditComments = await this.reddit.getNewSubredditComments(
        get(this.subreddit, "value", this.subreddit),
        this.subredditPost,
        this.numberOfParents,
        this.depth,
        this.includeSubredditDetails,
        10,
      );
      const { children: comments = [] } = redditComments.data;
      if (comments.length === 0) {
        console.log("No data available, skipping iteration");
        return;
      }
      comments.reverse().forEach(this.emitRedditEvent);
    },
  },
  methods: {
    ...common.methods,
    generateEventMetadata(redditEvent) {
      return {
        id: redditEvent.data.name,
        summary: redditEvent.data.body,
        ts: redditEvent.data.created,
      };
    },
    async getAllSubredditPosts() {
      const results = [];
      let before = null;
      do {
        const redditLinks = await this.reddit.getNewSubredditLinks(
          get(this.subreddit, "value", this.subreddit),
          {
            before,
          },
        );
        const { children: links = [] } = redditLinks.data;
        if (links.length === 0) {
          break;
        }
        before = links[0].data.name;
        links.forEach((link) => {
          const {
            title,
            id,
          } = link.data;
          results.push({
            title,
            id,
          });
        });
      } while (before);
      return results;
    },
  },
  async run() {
    const redditComments = await this.reddit.getNewSubredditComments(
      get(this.subreddit, "value", this.subreddit),
      this.subredditPost,
      this.numberOfParents,
      this.depth,
      this.includeSubredditDetails,
    );
    const { children: comments = [] } = redditComments.data;
    if (comments.length === 0) {
      console.log("No data available, skipping iteration");
      return;
    }
    comments.reverse().forEach(this.emitRedditEvent);
  },
};
