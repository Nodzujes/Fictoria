// eslint-disable-next-line no-unused-vars
import sequelize from '../config/sequelize.js';
import User from './users.js';
import Post from './posts.js';
import Category from './categories.js';
import Like from './likes.js';
import PostComment from './posts_comments.js';
import PostBlock from './post_blocks.js';
import PostCategory from './post_categories.js';
import UserCategory from './user_categories.js';
import VerificationCode from './verification_codes.js';

// Определение связей
User.hasMany(Post, { foreignKey: 'user_id', onDelete: 'RESTRICT' });
Post.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Like, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Post.hasMany(Like, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(Post, { foreignKey: 'post_id' });

Post.hasMany(PostComment, { foreignKey: 'id_post', onDelete: 'RESTRICT' });
User.hasMany(PostComment, { foreignKey: 'id_user', onDelete: 'RESTRICT' });
PostComment.belongsTo(Post, { foreignKey: 'id_post' });
PostComment.belongsTo(User, { foreignKey: 'id_user' });

Post.hasMany(PostBlock, { foreignKey: 'post_id', onDelete: 'RESTRICT' });
PostBlock.belongsTo(Post, { foreignKey: 'post_id' });

Post.hasMany(PostCategory, { foreignKey: 'post_id', onDelete: 'RESTRICT' });
Category.hasMany(PostCategory, { foreignKey: 'category_id', onDelete: 'RESTRICT' });
PostCategory.belongsTo(Post, { foreignKey: 'post_id' });
PostCategory.belongsTo(Category, { foreignKey: 'category_id' });

User.hasMany(UserCategory, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserCategory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(VerificationCode, { foreignKey: 'user_id', onDelete: 'RESTRICT' });
VerificationCode.belongsTo(User, { foreignKey: 'user_id' });

// Экспорт моделей
const models = {
    User,
    Post,
    Category,
    Like,
    PostComment,
    PostBlock,
    PostCategory,
    UserCategory,
    VerificationCode,
};

export default models;