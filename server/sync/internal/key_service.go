package internal

type KeyVerificationService struct {
	keyVerificationCollection *KeyVerificationCollection
}

func NewKeyVerificationService(keyVerificationCollection *KeyVerificationCollection) *KeyVerificationService {
	return &KeyVerificationService{keyVerificationCollection}
}

func (s *KeyVerificationService) GetKeyByUser(user string) ([]byte, error) {
	verification, err := s.keyVerificationCollection.FindByUser(user)
	if err != nil {
		return nil, err
	}

	if verification == nil {
		return nil, nil
	}

	return verification.Key, nil
}

func (s *KeyVerificationService) SetKey(user string, key []byte) error {
	verification := KeyVerification{
		User: user,
		Key:  key,
	}

	return s.keyVerificationCollection.Upsert(verification)
}

func (s *KeyVerificationService) OnUserDeleted(userId string) error {
	return s.keyVerificationCollection.DeleteByUser(userId)
}
