import * as cookie from 'cookie';
import Iron from '@hapi/iron';
import { lists } from '.keystone/api';

const getCurrentUser = async req => {
	const cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
	const unsealedItem = cookies && await Iron.unseal(cookies['keystonejs-session'], process.env.SESSION_SECRET, Iron.defaults);
	const user = unsealedItem && await lists.User.findOne({
		where: { id: unsealedItem.itemId },
		query: 'id name'
	});

	return user || false;
};

export {
	getCurrentUser
};