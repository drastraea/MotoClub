package domain

import "testing"

func TestRoleValid(t *testing.T) {
	for _, r := range []Role{RoleVisitor, RoleMember, RoleAdmin, RoleSuperadmin} {
		if !r.Valid() {
			t.Errorf("expected %q to be valid", r)
		}
	}
	if Role("ghost").Valid() {
		t.Error("expected unknown role to be invalid")
	}
}

func TestPrincipalHasRole(t *testing.T) {
	p := Principal{ID: 1, Role: RoleAdmin}
	if !p.HasRole(RoleAdmin, RoleSuperadmin) {
		t.Error("expected admin to match")
	}
	if p.HasRole(RoleMember) {
		t.Error("did not expect admin to match member")
	}
	if p.HasRole() {
		t.Error("empty role set should never match")
	}
}
