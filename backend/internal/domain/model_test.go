package domain

import (
	"testing"
	"time"
)

func TestMemberEffectiveStatus(t *testing.T) {
	now := time.Date(2026, 7, 2, 0, 0, 0, 0, time.UTC)
	past := now.AddDate(-1, 0, 0)
	future := now.AddDate(1, 0, 0)

	cases := []struct {
		name string
		m    Member
		want Status
	}{
		{"approved and not expired", Member{Status: StatusApproved, MembershipExpiresAt: &future}, StatusApproved},
		{"approved and expired", Member{Status: StatusApproved, MembershipExpiresAt: &past}, StatusExpired},
		{"approved without expiry", Member{Status: StatusApproved}, StatusApproved},
		{"pending is never expired", Member{Status: StatusPending, MembershipExpiresAt: &past}, StatusPending},
		{"rejected is never expired", Member{Status: StatusRejected, MembershipExpiresAt: &past}, StatusRejected},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := tc.m.EffectiveStatus(now); got != tc.want {
				t.Errorf("got %q, want %q", got, tc.want)
			}
		})
	}
}

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
