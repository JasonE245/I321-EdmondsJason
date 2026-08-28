const users = [{ id: 1, name: "Alice" }];

function getAllUsers(req, res) {
    res.json(users);
}

module.exports = { getAllUsers };