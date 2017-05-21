/* CLIENTBOUND PACKETS ONLY */

module.exports = {
  // Identifier: PacketClass
  Handshake:     require('./HandshakeRequest'),
  InitPlayer:    require('./InitPlayer'),
  ForgetPlayer:  require('./ForgetPlayer'),
  UpdatePlayer:  require('./UpdatePlayer'),
  SpawnBullet:   require('./SpawnBullet'),
  AddFood:       require('./AddFood')
};
