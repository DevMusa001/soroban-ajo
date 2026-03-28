#![cfg(test)]

use soroban_ajo::{AjoContract, AjoContractClient, AjoError, GroupTemplate, TemplateConfig};
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup() -> (Env, AjoContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract(token_admin);
    (env, client, creator, token)
}

// ── get_template_config ───────────────────────────────────────────────────

#[test]
fn test_monthly_savings_config() {
    let (_env, client, _, _) = setup();
    let cfg: TemplateConfig = client.get_template_config(&GroupTemplate::MonthlySavings);
    assert_eq!(cfg.template_type, GroupTemplate::MonthlySavings);
    assert_eq!(cfg.default_cycle_duration, 2_592_000);
    assert_eq!(cfg.default_grace_period, 86_400);
    assert_eq!(cfg.default_penalty_rate, 5);
    assert_eq!(cfg.suggested_contribution_min, 10_000_000);
    assert_eq!(cfg.suggested_contribution_max, 1_000_000_000);
    assert_eq!(cfg.suggested_max_members, 12);
}

#[test]
fn test_weekly_savings_config() {
    let (_env, client, _, _) = setup();
    let cfg = client.get_template_config(&GroupTemplate::WeeklySavings);
    assert_eq!(cfg.template_type, GroupTemplate::WeeklySavings);
    assert_eq!(cfg.default_cycle_duration, 604_800);
    assert_eq!(cfg.default_grace_period, 43_200);
    assert_eq!(cfg.default_penalty_rate, 10);
    assert_eq!(cfg.suggested_max_members, 10);
}

#[test]
fn test_emergency_fund_config() {
    let (_env, client, _, _) = setup();
    let cfg = client.get_template_config(&GroupTemplate::EmergencyFund);
    assert_eq!(cfg.template_type, GroupTemplate::EmergencyFund);
    assert_eq!(cfg.default_cycle_duration, 1_209_600);
    assert_eq!(cfg.default_grace_period, 172_800);
    assert_eq!(cfg.default_penalty_rate, 3);
    assert_eq!(cfg.suggested_max_members, 8);
}

#[test]
fn test_investment_club_config() {
    let (_env, client, _, _) = setup();
    let cfg = client.get_template_config(&GroupTemplate::InvestmentClub);
    assert_eq!(cfg.template_type, GroupTemplate::InvestmentClub);
    assert_eq!(cfg.default_cycle_duration, 7_776_000);
    assert_eq!(cfg.default_grace_period, 604_800);
    assert_eq!(cfg.default_penalty_rate, 2);
    assert_eq!(cfg.suggested_max_members, 20);
}

#[test]
fn test_custom_template_config() {
    let (_env, client, _, _) = setup();
    let cfg = client.get_template_config(&GroupTemplate::Custom);
    assert_eq!(cfg.template_type, GroupTemplate::Custom);
    assert_eq!(cfg.suggested_max_members, 50);
}

// ── list_available_templates ──────────────────────────────────────────────

#[test]
fn test_list_available_templates_returns_all_five() {
    let (_env, client, _, _) = setup();
    let templates = client.list_available_templates();
    assert_eq!(templates.len(), 5);
    assert_eq!(templates.get(0).unwrap(), GroupTemplate::MonthlySavings);
    assert_eq!(templates.get(1).unwrap(), GroupTemplate::WeeklySavings);
    assert_eq!(templates.get(2).unwrap(), GroupTemplate::EmergencyFund);
    assert_eq!(templates.get(3).unwrap(), GroupTemplate::InvestmentClub);
    assert_eq!(templates.get(4).unwrap(), GroupTemplate::Custom);
}

// ── create_group_from_template ────────────────────────────────────────────

#[test]
fn test_create_group_from_monthly_savings_template() {
    let (_env, client, creator, token) = setup();
    // 1 XLM = 10_000_000 stroops — exactly at the minimum
    let group_id = client.create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::MonthlySavings,
        &10_000_000,
        &12,
    );
    let group = client.get_group(&group_id);
    assert_eq!(group.cycle_duration, 2_592_000);
    assert_eq!(group.grace_period, 86_400);
    assert_eq!(group.penalty_rate, 5);
    assert_eq!(group.contribution_amount, 10_000_000);
    assert_eq!(group.max_members, 12);
}

#[test]
fn test_create_group_from_weekly_savings_template() {
    let (_env, client, creator, token) = setup();
    let group_id = client.create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::WeeklySavings,
        &1_000_000,
        &5,
    );
    let group = client.get_group(&group_id);
    assert_eq!(group.cycle_duration, 604_800);
    assert_eq!(group.grace_period, 43_200);
    assert_eq!(group.penalty_rate, 10);
}

#[test]
fn test_create_group_from_emergency_fund_template() {
    let (_env, client, creator, token) = setup();
    let group_id = client.create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::EmergencyFund,
        &50_000_000,
        &8,
    );
    let group = client.get_group(&group_id);
    assert_eq!(group.cycle_duration, 1_209_600);
    assert_eq!(group.grace_period, 172_800);
    assert_eq!(group.penalty_rate, 3);
}

#[test]
fn test_create_group_from_investment_club_template() {
    let (_env, client, creator, token) = setup();
    let group_id = client.create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::InvestmentClub,
        &100_000_000,
        &10,
    );
    let group = client.get_group(&group_id);
    assert_eq!(group.cycle_duration, 7_776_000);
    assert_eq!(group.grace_period, 604_800);
    assert_eq!(group.penalty_rate, 2);
}

#[test]
fn test_create_group_from_custom_template() {
    let (_env, client, creator, token) = setup();
    // Custom template min is 1_000_000
    let group_id = client.create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::Custom,
        &5_000_000,
        &20,
    );
    let group = client.get_group(&group_id);
    assert_eq!(group.contribution_amount, 5_000_000);
    assert_eq!(group.max_members, 20);
}

// ── parameter validation ──────────────────────────────────────────────────

#[test]
fn test_contribution_below_template_minimum_is_rejected() {
    let (_env, client, creator, token) = setup();
    // MonthlySavings min is 10_000_000; pass 1 stroop
    let result = client.try_create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::MonthlySavings,
        &1,
        &5,
    );
    assert_eq!(result, Err(Ok(AjoError::ContributionAmountZero)));
}

#[test]
fn test_max_members_below_minimum_rejected_via_template() {
    let (_env, client, creator, token) = setup();
    let result = client.try_create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::WeeklySavings,
        &1_000_000,
        &1, // below minimum of 2
    );
    assert_eq!(result, Err(Ok(AjoError::MaxMembersBelowMinimum)));
}

#[test]
fn test_max_members_above_limit_rejected_via_template() {
    let (_env, client, creator, token) = setup();
    let result = client.try_create_group_from_template(
        &creator,
        &token,
        &GroupTemplate::Custom,
        &1_000_000,
        &101, // above hard limit of 100
    );
    assert_eq!(result, Err(Ok(AjoError::MaxMembersAboveLimit)));
}

// ── suggested ranges ──────────────────────────────────────────────────────

#[test]
fn test_suggested_ranges_are_sensible() {
    let (_env, client, _, _) = setup();
    for template in [
        GroupTemplate::MonthlySavings,
        GroupTemplate::WeeklySavings,
        GroupTemplate::EmergencyFund,
        GroupTemplate::InvestmentClub,
        GroupTemplate::Custom,
    ] {
        let cfg = client.get_template_config(&template);
        assert!(cfg.suggested_contribution_min > 0);
        assert!(cfg.suggested_contribution_max >= cfg.suggested_contribution_min);
        assert!(cfg.suggested_max_members >= 2);
        assert!(cfg.default_cycle_duration > 0);
        assert!(cfg.default_penalty_rate <= 100);
    }
}
