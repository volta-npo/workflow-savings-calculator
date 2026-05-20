import unittest

from workflow_savings_calculator_backend.engine import DOMAIN_ROWS, PRODUCT_SLUG, approval_matrix, build_release_packet, implementation_readiness, portfolio_rank, summarize_rows, validate_payload


class BackendEngineTests(unittest.TestCase):
    def test_release_packet_scores_approved_payload(self):
        payload = {"rows": [{"label": row, "score": 95, "evidence": f"evidence for {row}", "approved": True} for row in DOMAIN_ROWS]}
        packet = build_release_packet(payload)
        self.assertEqual(packet["product"]["slug"], PRODUCT_SLUG)
        self.assertEqual(packet["score"]["score"], 95)
        self.assertTrue(packet["score"]["approved"])
        self.assertEqual(packet["score"]["coverage"], 100)
        self.assertRegex(packet["release_hash"], r"^[0-9a-f]{16}$")
        self.assertIn("workflow_roi", packet)
        self.assertIn("sensitivity", packet)

    def test_missing_evidence_blocks_approval(self):
        packet = build_release_packet({"rows": []})
        self.assertFalse(packet["score"]["approved"])
        self.assertGreater(len(packet["score"]["warnings"]), 0)
        self.assertEqual(len(summarize_rows({"rows": []})), len(DOMAIN_ROWS))


    def test_roi_payload_generates_risk_adjusted_recommendation(self):
        payload = {
            "rows": [{"label": row, "score": 95, "evidence": f"evidence for {row}", "approved": True} for row in DOMAIN_ROWS],
            "workflow": {
                "monthly_volume": 300,
                "minutes_per_item": 20,
                "hourly_rate": 50,
                "build_hours": 25,
                "maintenance_hours_monthly": 2,
                "confidence_percent": 90,
                "failure_risk_percent": 10,
                "owner_approval": True,
            },
        }
        packet = build_release_packet(payload)
        self.assertEqual(packet["workflow_roi"]["recommendation"], "build")
        self.assertGreater(packet["workflow_roi"]["risk_adjusted_monthly_savings"], 500)
        self.assertEqual(len(packet["sensitivity"]), 3)

    def test_schema_validation_blocks_sensitive_payload_without_owner_approval(self):
        errors = validate_payload({"workflow": {"contains_sensitive_data": True}})
        self.assertIn("owner_approval is required for workflows with sensitive data", errors)

    def test_portfolio_and_approval_layers_support_saas_triage(self):
        payload = {
            "workflow": {
                "failure_risk_percent": 45,
                "contains_sensitive_data": True,
                "owner_approval": True,
                "approvals": {"owner": True, "technical_lead": True, "mentor": True},
                "data_access_confirmed": True,
                "rollback_owner": "Ops lead",
                "exception_path": "Manual fallback",
                "support_owner": "Automation pod",
                "verification_plan": "Compare four-week baseline to post-launch actuals",
            },
            "candidates": [
                {"name": "Invoice reminders", "monthly_volume": 400, "minutes_per_item": 8, "hourly_rate": 35, "build_hours": 20, "failure_risk_percent": 10},
                {"name": "Fragile CRM sync", "monthly_volume": 50, "minutes_per_item": 10, "hourly_rate": 35, "build_hours": 80, "failure_risk_percent": 70},
            ],
        }
        self.assertTrue(approval_matrix(payload)["approved"])
        self.assertTrue(implementation_readiness(payload)["ready"])
        ranked = portfolio_rank(payload)
        self.assertEqual(ranked[0]["name"], "Invoice reminders")
        packet = build_release_packet(payload)
        self.assertIn("approval_matrix", packet)
        self.assertIn("portfolio_rank", packet)
        self.assertIn("implementation_readiness", packet)


if __name__ == "__main__":
    unittest.main()


class ServerModuleTests(unittest.TestCase):
    def test_health_handler_exists(self):
        from workflow_savings_calculator_backend.server import Handler
        self.assertTrue(hasattr(Handler, "do_GET"))
        self.assertTrue(hasattr(Handler, "do_POST"))
