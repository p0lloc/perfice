package internal

import "crypto/rand"

type SaltService struct {
	saltCollection *SaltCollection
}

func NewSaltService(saltCollection *SaltCollection) *SaltService {
	return &SaltService{
		saltCollection: saltCollection,
	}
}

func (s *SaltService) generateSalt(user string) ([]byte, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return nil, err
	}

	salt := Salt{
		User: user,
		Salt: bytes,
	}

	err = s.saltCollection.Insert(salt)
	if err != nil {
		return nil, err
	}

	return salt.Salt, nil
}

func (s *SaltService) GetSalt(user string) ([]byte, error) {
	salt, err := s.saltCollection.FindByUser(user)
	if err != nil {
		return nil, err
	}

	if salt == nil {
		return s.generateSalt(user)
	}

	return salt.Salt, nil
}

func (s *SaltService) OnUserDeleted(userId string) error {
	return s.saltCollection.DeleteByUser(userId)
}
